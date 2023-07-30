import {Observable, timer} from 'rxjs';
import {addSeconds, set} from 'date-fns';
import {v4 as uuidv4} from 'uuid';

type Status = 'waiting' | 'started' | 'paused' | 'concluded' | 'canceled';

class Tarefa {

  readonly id: string;
  name: string;
  start_date: Date | null;
  status: Status;
  private elapsed: number;
  private temporizer: Observable<any>;


  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
    this.elapsed = 0;
    this.status = 'waiting';
    this.temporizer = timer(1000, 1000);
    this.temporizer.subscribe({
      next: (value) => {
        if (this.status === 'started') {
          this.elapsed++;
        }
      },
    });
  }

  get timer(): number {
    if (this.start_date !== null) {
      return 10;
    }
    return 0;
  }

  get allocattedTime(): Date {
    const zeroDate: Date = set(new Date(), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
    if (this.start_date !== null) {
      return addSeconds(zeroDate, this.elapsed);
    }
    return zeroDate;
  }

  static stopOthers(id: string, tarefas: Tarefa[]): void {
    for (const tar of tarefas) {
      if (tar.status === 'started' && tar.id !== id) {
        tar.pause();
      }
    }
  }

  static totalTime(tarefas: Tarefa[]): Date {
    const base: Date = set(new Date(), {hours: 0, minutes: 0, seconds: 0, milliseconds: 0});
    const total: number = tarefas
      .map(t => t.elapsed)
      .reduce((val, currentValue) => val + currentValue);
    return addSeconds(base, total);
  }

  init(tarefas: Tarefa[]): void {
    Tarefa.stopOthers(this.id, tarefas);
    this.start_date = new Date();
    this.status = 'started';
  }

  start(tarefas: Tarefa[]): void {
    Tarefa.stopOthers(this.id, tarefas);
    this.status = 'started';
  }

  pause(): void {
    if (this.start_date === null) {
      throw new Error('Não é possível parar o contador pois ele ainda não foi iniciado.');
    }
    this.status = 'paused';
  }

  finalize(): void {
    this.status = 'concluded';
  }

  cancel(): void {
    this.status = 'canceled';
  }

  restart(tarefas: Tarefa[]): void {
    Tarefa.stopOthers(this.id, tarefas);
    this.status = 'started';
  }
}

export {Tarefa, Status};
