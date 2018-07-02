function makeEditable(options) {
  // If this was initiated from a click, use the click target
  if (options.event) {
    $(options.event.target)
      .attr('contenteditable', 'true')
      .css({ 'border-bottom': '1px dotted black' });
    // Otherwise it was initiated from clicking something else and we have
    // specified a selector
  } else {
    options.group
      .find(options.selector)
      .attr('contenteditable', 'true')
      .css({ 'border-bottom': '1px dotted black' });
  }
}

// START D
function fadeOutElement(selector) {
  $(selector).fadeOut('fast', function removeStickyFooter() {
    $(this).remove();
  });
}

export { makeEditable, fadeOutElement };
