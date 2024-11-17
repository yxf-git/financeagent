import { fetchEventSource } from "@microsoft/fetch-event-source";
export class FetchSSE {
  private controller: AbortController;
  private url: string;
  private params: object;
  private onopen: Function = () => { };
  private onmessage: Function = () => { };
  private onclose: Function = () => { };
  private onerror: Function = () => { };

  constructor(url: string, params: object) {
    this.controller = new AbortController();
    this.url = url;
    this.params = params
  }
  send() {
    fetchEventSource(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": 'text/event-stream',
        "token": localStorage.getItem("token") || '',
      },
      body: JSON.stringify(this.params),
      signal: this.controller.signal,
      onopen: (e): any => {
        if (e.status >= 400) {
          this.onerror({
            ...e,
            message: `服务环境异常 ${e.status}`
          });
          return
        }
        this.onopen()
      },
      onmessage: (e) => {
        // console.log("fetchEventSource：message", e);
        this.onmessage(e.data);
      },
      onerror: (err) => {
        console.log("fetchEventSource：error", err);
        this.onerror(err);
      },
      onclose: () => {
        console.log("fetchEventSource：close");
        this.onclose();
      },
    });
  }
  abort() {
    this.controller.abort()
  }
  setOpenEvent(callback: Function) {
    this.onopen = callback
  }
  setMessageEvent(callback: Function) {
    this.onmessage = callback
  }
  setCloseEvent(callback: Function) {
    this.onclose = callback
  }
  setErrorEvent(callback: Function) {
    this.onerror = callback
  }
}
