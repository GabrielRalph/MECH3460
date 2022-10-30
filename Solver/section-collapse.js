function addCollapseHandlers(element) {
  let headers = element.querySelector("section > h1");
  for (let header of headers) {
    let section = header.parentNode;
    section.setAttribute("header-height", header.scrollHeight);
    header.ondblclick = () => toggleCollapsed(section);
    toggleCollapsed(section);
    toggleCollapsed(section);
  }
}


function toggleCollapse(section) {
  let collapsed = section.getAttribute("collapsed");
  section.toggleAttribute("collapsed", collapsed !== null);
}
