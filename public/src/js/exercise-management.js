// Import statements will go here, webpack & Babel will take care of the rest
// Import JQuery for all of this to work!
import 'jquery';

$('#exercise-groups').on('click', groupClick => {
  // currentTarget is where the listener is attached
  // target is the actual click target
  const groupClickTarget = $(groupClick.target);
  // If we clicked the edit button
  if (groupClickTarget.hasClass('edit-entry')) {
    // Get the first parent box
    const exerciseGroup = groupClickTarget.closest('.box');
    // Hide edit control
    exerciseGroup.find('.edit-entry').fadeOut('fast', () => {
      // After edit fades out, fade in save/trash/cancel buttons
      exerciseGroup.find('.box-controls').append(
        $(`
            <i class='icon'>
              <a class='mdi mdi-content-save save-group' title='save group'></a>
            </i>
            <i class='icon'>
              <a class='mdi mdi-delete delete-group' title='delete group'></a>
            </i>
            <i class='icon'>
              <a class='mdi mdi-close-circle cancel-edits' title='cancel edits'></a>
            </i>
            `)
          .hide()
          .fadeIn('fast')
      );
    });
    // and set the contents of the box to be editable!
    // List Elements
    exerciseGroup
      .find('.exercise-name')
      .attr('contenteditable', 'true')
      .css({ 'border-bottom': '1px dotted black' });
    // Group Name
    exerciseGroup
      .find('.group-name')
      .attr('contenteditable', 'true')
      .css({ 'border-bottom': '1px dotted #000' });
    // Points per Hour
    exerciseGroup
      .find('.points-per-hour')
      .attr('contenteditable', 'true')
      .css({ 'border-bottom': '1px dotted #000' });

    // Also add delete button to each exercise li
    exerciseGroup.find('li').append(
      $(`
            <i class='icon'>
              <a class='mdi mdi-delete delete-exercise' title='delete exercise'></a>
            </i>
          `)
        .hide()
        .fadeIn('fast')
    );

    // Add a button to add another list element
    exerciseGroup.find('.content').append(
      $(`
          <button class='button is-outlined is-small add-exercise-to-group' style='margin-left: 2em;' title='add another exercise to this group'>
            <i class='icon is-small'>
              <i class='mdi mdi-plus-box-outline'></i>
            </i>
            <span>Add Exercise</span>
          </button>
        `)
        .hide()
        .fadeIn('fast')
    );

    // HANDLERS FOR EDITING!!

    // Add another list item
    $('.add-exercise-to-group').on('click', () => {
      exerciseGroup.find('ul').append(`
            <li>
              <span contenteditable='true' style='border-bottom: 1px dotted #000;'>exercise</span>
              <i class='icon'>
                <a class='mdi mdi-delete delete-exercise'></a>
              </i>
            </li>
          `);
    });

    exerciseGroup.find('ul').on('click', listClick => {
      const listClickTarget = $(listClick.target);
      // Did we click a delete exercise button?
      if (listClickTarget.hasClass('delete-exercise')) {
        listClickTarget.parents('li').remove();
      }
    });
  }
});
