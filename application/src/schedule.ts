import { CHECK_INTERVAL, MAX_RETRY } from "./config";

export type ScheduledFunction = () => Promise<boolean> | boolean;

let id = 1;

export class Schedule {
  private readonly maxRetry: number;
  private readonly interval: number;
  private fn: ScheduledFunction;
  private timeout: NodeJS.Timeout;
  private retries = 0;
  private id: number;
  private aborted = false;

  constructor(maxRetry: number, interval: number) {
    this.maxRetry = maxRetry;
    this.interval = interval;
    this.id = id++;
  }

  private log(message: string) {
    console.log(`[Schedule #${this.id}] ${message}`);
  }

  public schedule(fn: ScheduledFunction): Schedule {
    this.log("Scheduling FN");
    this.fn = fn;
    return this;
  }

  public run(): Schedule {
    if (this.aborted) {
      this.log("Aborted");
    } else {
      this.log(`Running (retry: ${this.retries})`);
      this.timeout = setTimeout(async () => {
        this.log("Executing");
        let result = false;
        try {
          result = await this.fn();
        } catch (e) {
          result = false;
        }
        this.log("Result: " + result);
        if (!result && this.retries < this.maxRetry) {
          this.retries++;
          this.log("Retry");
          this.run();
        } else {
          this.log("Done");
        }
      }, this.interval);
    }
    return this;
  }

  public abort(): Schedule {
    this.log("Aborting");
    this.aborted = true;
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    return this;
  }
}

export const schedule = (
  fn: ScheduledFunction,
  maxRetry = MAX_RETRY,
  interval = CHECK_INTERVAL
): Schedule => {
  const s = new Schedule(maxRetry, interval);
  s.schedule(fn);
  return s;
};
