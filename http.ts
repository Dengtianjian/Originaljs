export default {
  fetch(url: string, method: string = "GET", query: object = {}, params: object = {}): Promise<any> {
    Object.assign(params, query);
    const requestParmas = {
      method
    }
    if (method !== "GET") {
      requestParmas['body'] = JSON.stringify(params);
    }
    return fetch(url, requestParmas).then(res => res.json());
  },
  get(url: string, query: object = {}, params: object = {}): Promise<any> {
    return this.fetch(url, "GET", query, params);
  }
}