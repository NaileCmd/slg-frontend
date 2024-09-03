export interface LocationRef {
    id: string;
    name: string;
}

export interface Discipline {
    id: string;
    abbreviation: string;
    name: string;    
}

export interface CalendarEvent {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date;
    eventType: string;
    location: LocationRef;
    shootingRanges: string[];
    description: string;
    members: string[];
    disciplines: Discipline[];    
}

export interface CalendarWeek {
    mo: CalendarDay;
    tu: CalendarDay;
    we: CalendarDay;
    th: CalendarDay;
    fr: CalendarDay;
    sa: CalendarDay;
    su: CalendarDay;
}

export interface CalendarDay {
    day: string;
    dayEvents: CalendarEvent[];
}

export interface CellData {
    dayNumber: string | null;
    eventSet: Set<string>;
}
