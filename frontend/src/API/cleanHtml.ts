// helper in src/API/cleanHtml.ts
export function stripHtml(html: string, max = 200) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || "";
    return text.length > max ? text.slice(0, max) + "…" : text;
  }
  