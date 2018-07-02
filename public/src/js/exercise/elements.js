const boxControls = `
<i class='icon'>
  <a class='mdi mdi-content-save save-group' title='save group'></a>
</i>
<i class='icon'>
  <a class='mdi mdi-delete delete-group' title='delete group'></a>
</i>
<i class='icon'>
  <a class='mdi mdi-close-circle cancel-edits' title='cancel edits'></a>
</i>
`;

function blankExercise(id) {
  return `
  <span class='button' draggable='false' id='${id}'>
    <span contenteditable='true' style='border-bottom: 1px dotted #000;' class='exercise-name'>exercise</span>
  </span>
  `;
}

const addExerciseButton = `
<button class='button is-outlined add-exercise-to-group' title='add another exercise to this group'>
  <i class='icon'>
    <i class='mdi mdi-plus-box-outline'></i>
  </i>
  <span>Add Exercise</span>
</button>
`;

const deleteExerciseButton = `
<i class='icon'>
  <a class='mdi mdi-delete delete-exercise' title='delete exercise'></a>
</i>
`;

function newExerciseBox(id) {
  return `
  <div class="box exercise-group" data-name="exerciseBox${id}" droppable="true">
    <strong class="group-name">Exercise Group</strong>
    <span class="is-pulled-right box-controls">
      <i class="icon">
      <a class="mdi mdi-pencil edit-entry"></a>
      </i>
    </span>
    <div class="content">
      <small>
        <span class="points-per-hour">0</span>
        <span>&nbsp;pts/hr</span>
      </small>
    </div>
    <div class="content">
      <div class="buttons exercises"></div>
    </div>
  </div>
  `;
}

export { blankExercise, deleteExerciseButton, addExerciseButton, newExerciseBox, boxControls };
