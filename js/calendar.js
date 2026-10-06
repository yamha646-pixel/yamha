/* Shared, offline calendar. A date range stays one source row. No network calls. */
(function (root) {
  'use strict';

  const DAY = 86400000;
  const weekdays = ['월', '화', '수', '목', '금', '토', '일'];
  const copy=(key,fallback,vars={})=>root.YamhaContent?root.YamhaContent.text(key,vars):fallback.replace(/\{(\w+)\}/g,(all,name)=>Object.prototype.hasOwnProperty.call(vars,name)?String(vars[name]??''):all);
  const defaultType=()=>copy('calendar.defaultType','방송');
  const palette = {
    pink: '#ffd9e5', lime: '#def4bd', green: '#def4bd', blue: '#dcecfb',
    yellow: '#fff0b8', orange: '#ffe0be', purple: '#e9def8', red: '#ffd6d4',
    gray: '#ebe6e8', cream: '#f7efd9'
  };
  const mounted = new WeakMap();
  let instanceId = 0;

  function utcDate(year, month, day) {
    const result = new Date(0);
    result.setUTCFullYear(year, month, day);
    result.setUTCHours(0, 0, 0, 0);
    return result;
  }
  function formatDate(date) {
    return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    return year >= 1 && formatDate(utcDate(year, month - 1, day)) === value;
  }
  function dateNumber(value) { return Date.parse(value + 'T00:00:00Z'); }
  function todayKST(now) {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now === undefined ? new Date() : new Date(now));
    const part = type => parts.find(item => item.type === type).value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  function endDate(row) {
    return validDate(row.end_date) && row.end_date >= row.date ? row.end_date : row.date;
  }
  function contains(row, date) { return validDate(row.date) && row.date <= date && endDate(row) >= date; }

  // Never rewrite an input row: callbacks must receive the exact original object,
  // including unknown option fields. An invalid end date displays as a single day.
  function normalize(rows) {
    return (Array.isArray(rows) ? rows : []).map((row, index) => row && validDate(row.date) ? ({
      row, index, start: row.date, end: endDate(row)
    }) : null).filter(Boolean).sort((a, b) => Number(b.end > b.start) - Number(a.end > a.start)
      || a.start.localeCompare(b.start) || b.end.localeCompare(a.end)
      || String(a.row.time || '').localeCompare(String(b.row.time || '')) || a.index - b.index);
  }

  // monthIndex is zero based; the returned month is one based, as in onMonthChange.
  // Each segment uses zero based, inclusive from/to columns and a zero based lane.
  function layoutMonth(year, monthIndex, rows) {
    if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) {
      throw new RangeError('A valid year and zero-based month are required.');
    }
    const first = utcDate(year, monthIndex, 1);
    const last = utcDate(year, monthIndex + 1, 0);
    const firstISO = formatDate(first), lastISO = formatDate(last);
    const offset = (first.getUTCDay() + 6) % 7;
    const count = Math.ceil((offset + last.getUTCDate()) / 7) * 7;
    const start = first.getTime() - offset * DAY;
    const events = normalize(rows);
    const days = Array.from({length: count}, (_, index) => {
      const date = new Date(start + index * DAY);
      return {date: formatDate(date), number: date.getUTCDate(), other: date.getUTCMonth() !== monthIndex, weekday: index % 7};
    });
    const weeks = [];
    for (let index = 0; index < count; index += 7) {
      const weekDays = days.slice(index, index + 7), occupied = [], segments = [];
      // Clip at the month boundary even when neighbouring dates are displayed.
      const visibleStart = weekDays[0].date > firstISO ? weekDays[0].date : firstISO;
      const visibleEnd = weekDays[6].date < lastISO ? weekDays[6].date : lastISO;
      events.forEach(event => {
        if (event.start > visibleEnd || event.end < visibleStart) return;
        const fromDate = event.start > visibleStart ? event.start : visibleStart;
        const toDate = event.end < visibleEnd ? event.end : visibleEnd;
        const from = Math.round((dateNumber(fromDate) - dateNumber(weekDays[0].date)) / DAY);
        const to = Math.round((dateNumber(toDate) - dateNumber(weekDays[0].date)) / DAY);
        let lane = 0;
        while (occupied[lane] && occupied[lane].some((taken, column) => taken && column >= from && column <= to)) lane++;
        if (!occupied[lane]) occupied[lane] = Array(7).fill(false);
        for (let column = from; column <= to; column++) occupied[lane][column] = true;
        segments.push({row: event.row, event: event.row, key: event.index, from, to, lane,
          date: fromDate, end: toDate, continued: event.start < fromDate, continues: event.end > toDate});
      });
      weeks.push({days: weekDays, segments, lanes: occupied.length});
    }
    return {year, month: monthIndex + 1, days, weeks, events};
  }

  function create(doc, tag, className, text) {
    const element = doc.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function colorValue(value, type) {
    if (Object.prototype.hasOwnProperty.call(palette, value)) return palette[value];
    if (typeof value === 'string' && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return value;
    return type === '휴방' ? palette.gray : palette.pink;
  }
  function inkColor(hex) {
    const full = hex.length === 4 ? '#' + [...hex.slice(1)].map(char => char + char).join('') : hex;
    const linear = [1, 3, 5].map(index => parseInt(full.slice(index, index + 2), 16) / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722 > .179 ? '#372c34' : '#ffffff';
  }
  function eventLabel(row) {
    return copy('calendar.eventLabel','{range} · {type} · {time}{title}{part2}',{
      range:row.date+(endDate(row)!==row.date?' ~ '+endDate(row):''),type:row.type||defaultType(),
      time:row.time?row.time+' ':'',title:row.title||row.type||defaultType(),
      part2:row.title2||row.time2||row.type2?copy('calendar.part2Label',' / 2부 {details}',{details:[row.time2,row.title2,row.type2].filter(Boolean).join(' ')}):''
    });
  }

  function mount(host, options) {
    if (!host || !host.ownerDocument) throw new TypeError('A calendar host element is required.');
    if (mounted.has(host)) mounted.get(host).destroy();
    options = options || {};
    const doc = host.ownerDocument;
    const id = `yamha-calendar-${++instanceId}`;
    const initial = validDate(options.date) ? options.date : todayKST();
    let year = Number(initial.slice(0, 4)), month = Number(initial.slice(5, 7)) - 1;
    let selected = validDate(options.selectedDate) ? options.selectedDate : '';
    let rows = Array.isArray(options.events) ? options.events.slice() : [];
    let destroyed = false;
    const shell = create(doc, 'section', 'calendar');
    shell.setAttribute('aria-label', options.editable ? '일정 편집 달력' : copy('calendar.label','방송 일정 달력'));
    host.replaceChildren(shell);
    let detailSource = null;

    function notifyMonth() {
      if (typeof options.onMonthChange === 'function') options.onMonthChange({year, month: month + 1});
    }
    function moveTo(value, focusAction) {
      const date = value instanceof Date ? todayKST(value) : value;
      if (destroyed || !validDate(date)) return false;
      const nextYear = Number(date.slice(0, 4)), nextMonth = Number(date.slice(5, 7)) - 1;
      const changed = year !== nextYear || month !== nextMonth;
      year = nextYear; month = nextMonth;
      detailSource = null;
      render();
      if (focusAction) shell.querySelector(`[data-calendar-action="${focusAction}"]`)?.focus();
      if (changed) notifyMonth();
      return true;
    }
    function renderDetail() {
      shell.querySelector('.calendar-detail')?.remove();
      if (!detailSource) return;
      const row = detailSource;
      const detail = create(doc, 'section', 'calendar-detail');
      detail.tabIndex = -1;
      detail.setAttribute('aria-label', copy('calendar.detailLabel','일정 상세'));
      const close = create(doc, 'button', 'calendar-detail-close', copy('calendar.close','닫기 ×'));
      close.type = 'button'; close.dataset.calendarAction = 'close-detail';
      detail.append(close, create(doc, 'p', 'calendar-detail-date', row.date + (endDate(row) !== row.date ? ' ~ ' + endDate(row) : '')),
        create(doc, 'h3', 'calendar-detail-title', row.title || row.type || defaultType()),
        create(doc, 'p', 'calendar-detail-meta', [row.type || defaultType(), row.time].filter(Boolean).join(' · ')));
      if (row.title2 || row.time2 || row.type2) {
        detail.append(create(doc, 'p', 'calendar-detail-part', copy('calendar.part2Detail','2부 · {details}',{details:[row.time2,row.title2,row.type2].filter(Boolean).join(' · ')})));
      }
      if (row.description) detail.append(create(doc, 'p', 'calendar-detail-description', row.description));
      shell.append(detail);
      detail.focus({preventScroll: true});
    }
    function render() {
      const layout = layoutMonth(year, month, rows), today = todayKST();
      shell.replaceChildren();
      shell.setAttribute('aria-label',options.editable?'일정 편집 달력':copy('calendar.label','방송 일정 달력'));
      const toolbar = create(doc, 'div', 'calendar-toolbar');
      const title = create(doc, 'h2', 'calendar-month', copy('calendar.month','{year}년 {month}월',{year,month:month+1}));
      title.id = id + '-month'; title.setAttribute('aria-live', 'polite');
      const controls = create(doc, 'div', 'calendar-controls');
      [['prev',copy('calendar.prevSymbol','‹'),copy('calendar.prev','이전 달')],['today',copy('calendar.today','오늘'),copy('calendar.todayLabel','이번 달로 이동')],['next',copy('calendar.nextSymbol','›'),copy('calendar.next','다음 달')]].forEach(([action, text, label]) => {
        const button = create(doc, 'button', 'calendar-nav calendar-nav-' + action, text);
        button.type = 'button'; button.dataset.calendarAction = action; button.setAttribute('aria-label', label);
        button.disabled = (action === 'prev' && year === 1 && month === 0) || (action === 'next' && year === 9999 && month === 11);
        controls.append(button);
      });
      toolbar.append(title, controls); shell.append(toolbar);
      const grid = create(doc, 'div', 'calendar-grid'); grid.setAttribute('aria-labelledby', title.id);
      const labels = create(doc, 'div', 'calendar-weekdays');
      weekdays.forEach((label, index) => labels.append(create(doc, 'span', 'calendar-weekday' + (index > 4 ? ' calendar-weekend-' + index : ''), copy('calendar.weekday.'+index,label))));
      grid.append(labels);
      layout.weeks.forEach(week => {
        const row = create(doc, 'div', 'calendar-week');
        row.style.setProperty('--calendar-lanes', String(Math.max(2, week.lanes)));
        const dates = create(doc, 'div', 'calendar-days');
        week.days.forEach(day => {
          const actionable = options.editable || typeof options.onDate === 'function';
          const date = create(doc, actionable ? 'button' : 'div', 'calendar-day'
            + (day.other ? ' calendar-day-other' : '') + (day.date === today ? ' calendar-day-today' : '')
            + (day.date === selected ? ' calendar-day-selected' : '') + (day.weekday > 4 ? ' calendar-weekend-' + day.weekday : ''));
          if (actionable) { date.type = 'button'; date.dataset.calendarDate = day.date; }
          date.setAttribute('aria-label', options.editable?day.date+' 새 일정 등록':copy('calendar.dayLabel','{date} 일정 보기',{date:day.date}));
          if (day.date === today) date.setAttribute('aria-current', 'date');
          date.append(create(doc, 'span', 'calendar-day-number', String(day.number)));
          if (options.editable) { const plus = create(doc, 'span', 'calendar-add', '+'); plus.setAttribute('aria-hidden', 'true'); date.append(plus); }
          dates.append(date);
        });
        row.append(dates);
        const bars = create(doc, 'div', 'calendar-bars');
        week.segments.forEach(segment => {
          const event = segment.row;
          const button = create(doc, 'button', 'calendar-event' + (segment.continued ? ' calendar-event-continued' : '')
            + (segment.continues ? ' calendar-event-continues' : '') + (event.highlight ? ' calendar-event-highlight' : '')
            + (segment.from === segment.to ? ' calendar-event-single' : ''));
          button.type = 'button'; button.dataset.calendarEvent = String(segment.key);
          button.style.gridColumn = `${segment.from + 1} / ${segment.to + 2}`;
          button.style.gridRow = String(segment.lane + 1);
          const color = colorValue(event.color, event.type);
          button.style.setProperty('--calendar-event-bg', color);
          button.style.setProperty('--calendar-event-ink', inkColor(color));
          button.title = eventLabel(event);
          button.setAttribute('aria-label', options.editable?button.title+' 수정':copy('calendar.eventAction','{event} 상세 보기',{event:button.title}));
          if (event.highlight) { const star = create(doc, 'span', 'calendar-event-star', copy('calendar.highlightSymbol','✦')); star.setAttribute('aria-hidden', 'true'); button.append(star); }
          if (event.time) button.append(create(doc, 'span', 'calendar-event-time', event.time));
          button.append(create(doc, 'span', 'calendar-event-title', event.title || event.type || defaultType()));
          if (event.title2 || event.time2 || event.type2) {
            const part = create(doc, 'span', 'calendar-event-part', copy('calendar.part2Badge','2부'));
            part.style.setProperty('--calendar-part-bg', colorValue(event.color2, event.type2));
            part.style.setProperty('--calendar-part-ink', inkColor(colorValue(event.color2, event.type2)));
            button.append(part);
          }
          bars.append(button);
        });
        row.append(bars); grid.append(row);
      });
      shell.append(grid);
      const shown = layout.events.filter(event => event.start <= formatDate(utcDate(year, month + 1, 0)) && event.end >= formatDate(utcDate(year, month, 1))).length;
      shell.append(create(doc, 'p', 'calendar-hint', shown
        ? options.editable ? '날짜를 누르면 새 일정, 일정 막대를 누르면 수정할 수 있어요.' : copy('calendar.hint','일정 막대를 누르면 자세한 내용을 볼 수 있어요.')
        : options.editable ? '이 달의 일정이 비어 있어요. 날짜를 눌러 일정을 등록해 주세요.' : copy('calendar.empty','이 달의 일정은 아직 준비 중이에요.')));
      renderDetail();
    }
    function onClick(event) {
      const button = event.target.closest('button');
      if (!button || !shell.contains(button)) return;
      const action = button.dataset.calendarAction;
      if (action === 'prev' || action === 'next') {
        const next = utcDate(year, month + (action === 'prev' ? -1 : 1), 1);
        moveTo(formatDate(next), action);
      } else if (action === 'today') {
        selected = todayKST(); moveTo(selected, action);
      } else if (action === 'close-detail') {
        const source = detailSource; detailSource = null; renderDetail();
        shell.querySelector(`[data-calendar-event="${rows.indexOf(source)}"]`)?.focus({preventScroll: true});
      } else if (button.dataset.calendarDate) {
        selected = button.dataset.calendarDate;
        moveTo(selected);
        shell.querySelector(`[data-calendar-date="${selected}"]`)?.focus({preventScroll: true});
        if (typeof options.onDate === 'function') options.onDate(selected);
      } else if (button.dataset.calendarEvent !== undefined) {
        const row = rows[Number(button.dataset.calendarEvent)];
        if (typeof options.onEvent === 'function') options.onEvent(row);
        else { detailSource = row; renderDetail(); }
      }
    }
    shell.addEventListener('click', onClick);
    const api = {
      setEvents(nextRows) {
        if (destroyed) return;
        rows = Array.isArray(nextRows) ? nextRows.slice() : [];
        detailSource = null; render();
      },
      goTo(date) { return moveTo(date); },
      refreshCopy() { if(!destroyed)render(); },
      destroy() {
        if (destroyed) return;
        destroyed = true; shell.removeEventListener('click', onClick); shell.remove();
        if (mounted.get(host) === api) mounted.delete(host);
      }
    };
    mounted.set(host, api); render();
    return api;
  }

  const api = {mount, todayKST, normalize, layoutMonth, validDate, endDate, contains};
  root.YamhaCalendar = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
