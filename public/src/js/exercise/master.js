// Import statements will go here, webpack & Babel will take care of the rest
// Import JQuery for all of this to work!
import 'jquery';
import '../jquery.dragster';
import {
  blankExercise,
  deleteExerciseButton,
  addExerciseButton,
  // newExerciseBox,
  boxControls,
} from './elements';
import { makeEditable, fadeOutElement } from './methods';

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
        $(boxControls)
          .hide()
          .fadeIn('fast')
      );

      // and set the contents of the box to be editable!
      // List Elements
      makeEditable({ group: exerciseGroup, selector: '.exercise-name' });
      // Group Name
      makeEditable({ group: exerciseGroup, selector: '.group-name' });
      // Points per Hour
      makeEditable({ group: exerciseGroup, selector: '.points-per-hour' });

      // Also add delete button to each exercise li
      exerciseGroup.find('li').append(
        $(deleteExerciseButton)
          .hide()
          .fadeIn('fast')
      );
    });

    // Add a button to add another list element
    exerciseGroup.find('.buttons.exercises').append(
      $(addExerciseButton)
        .hide()
        .fadeIn('fast')
    );

    // HANDLERS FOR EDITING!!

    let counter = 0;
    // Add another list item
    $('.add-exercise-to-group').on('click', buttonClick => {
      const newExerciseButton = blankExercise(`exercise-${counter}`);
      $(buttonClick.currentTarget).before(newExerciseButton);
      counter += 1;
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

const exerciseDragHandling = {
  dragstart(event) {
    $(this).css('opacity', '0.3');
    // Note - make sure we handle the fact that there could be repeated exercise
    // names, and therefore repeated IDs! Could we just create hashes for unique
    // element IDs?
    event.originalEvent.dataTransfer.setData('text/plain', event.target.id);
    $('#delete-exercise-zone').fadeIn('fast');
  },
  dragend(event) {
    event.preventDefault();
    // event.stopPropagation();
    $(this).css('opacity', '1');
    $('.box').removeClass('hovered-over');
    // Remove dropzone
    $('#delete-exercise-zone').fadeOut('fast');
  },
};

const boxDropHandling = {
  enter(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).addClass('hovered-over');
    return false;
  },
  leave(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).removeClass('hovered-over');
    return false;
  },
  drop(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    const elementID = event.originalEvent.dataTransfer.getData('text');
    const element = $(`#${elementID}`);
    $(this)
      .find('.exercises')
      .append(element);
    $(this).removeClass('hovered-over');
    $('#delete-exercise-zone').fadeOut('fast');
  },
};

// const exerciseGroupID = 0;

const deleteExerciseDropHandling = {
  enter(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).addClass('hovered-over');
    return false;
  },
  leave(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).removeClass('hovered-over');
    return false;
  },
  drop(dragsterEvent, event) {
    event.preventDefault();
    event.stopPropagation();
    const elementID = event.originalEvent.dataTransfer.getData('text');
    // delete the dragged element
    $(`#${elementID}`).remove();
    $(this).removeClass('hovered-over');
    $('#delete-exercise-zone').fadeOut('fast');
  },
};

// const newExerciseGroupDropHandling = {
//   enter(dragsterEvent, event) {
//     event.preventDefault();
//     event.stopPropagation();
//     $(this).addClass('hovered-over');
//     return false;
//   },
//   leave(dragsterEvent, event) {
//     event.preventDefault();
//     event.stopPropagation();
//     $(this).removeClass('hovered-over');
//     return false;
//   },
//   drop(dragsterEvent, event) {
//     event.preventDefault();
//     event.stopPropagation();
//     const elementID = event.originalEvent.dataTransfer.getData('text');
//     const element = $(`#${elementID}`);
//     // make a new box
//     const createdExerciseBox = $('#exercise-controls').before(newExerciseBox(exerciseGroupID));
//     // and add that exercise to it!
//     $(createdExerciseBox)
//       .find('.exercises')
//       .append(element);
//     // And add drop handling to this box
//     $(createdExerciseBox).dragster(boxDropHandling);
//     // Then remove the hover class from the button
//     $(this).removeClass('hovered-over');
//     // And increment the exercise IDs
//     exerciseGroupID += 1;
//   }
// };

$('.exercise').on(exerciseDragHandling);
$('.box').dragster(boxDropHandling);
// $('#new-exercise-group').dragster(newExerciseGroupDropHandling);
$('#delete-exercise-zone').dragster(deleteExerciseDropHandling);

const GetFit = {
  makeEditable,
  fadeOutElement,
};

window.GetFit = GetFit;
