const handlers = {
  // Function 1 to listen for: hamburger menu
  toggleNavBarBurger: () => {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(
      document.querySelectorAll('.navbar-burger'),
      0
    );
    // Check if there are any nav burgers
    if (navbarBurgers.length > 0) {
      // Add a click event on each of them
      navbarBurgers.forEach(element => {
        element.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          let target = element.dataset.target;
          target = document.getElementById(target);

          // Toggle the class on both the "navbar-burger" and the "navbar-menu"
          element.classList.toggle('is-active');
          target.classList.toggle('is-active');
        });
      });
    }
  },
  // deleteArticle: () => {
  //   $('.delete-article').on('click', e => {
  //     const id = $(e.target).attr('data-id');
  //     $.ajax({
  //       type: 'DELETE',
  //       url: `/data/${id}`,
  //       success: res => {
  //         alert('Deleting Article');
  //         window.location.href = '/';
  //       },
  //       error: err => {
  //         console.log(err);
  //       }
  //     });
  //   });
  // },
  updateEntry: () => {
    $('.update-entry').on('click', e => {
      // First stop the click from enacting its default behavior. If this is a
      // link, it will stop navigation. If this is a link to nowhere (href='#'),
      // it will stop the browser from going to the top of the page. This isn't
      // working for me though... why? Instead I've linked to href='#!', a
      // nonexistent element on the page (id='!'). This works.
      // e.preventDefault();
      // Get the Dates
      // const id = $(e.target).attr('data-id');
      const date = $(e.currentTarget).attr('data-date');
      // set current subroute based on location. So we'll post to sam if we're on /sam
      const route = window.location.pathname;
      // Add the loading class
      $(e.currentTarget).addClass('is-loading');
      // $(e.currentTarget)
      //   .find('i')
      //   .addClass('fa-spin');
      // Make the AJAX request to update the entry
      $.ajax({
        type: 'POST',
        url: `${route}/${date}`,
        // handle successes!
        success: () => {
          //    (res)
          window.location.reload();
        },
        // handle errors
        error: err => {
          console.log(err);
          window.location.reload();
        }
      });
    });
  },
  dismissMessagesNotification: () => {
    $('.messages').on('click', e => {
      // before we delete anything, check to see if this is the last alert
      if (
        $(e.target)
          .parent()
          .siblings().length === 0
      ) {
        // if it's the last alert, remove the entire .messages section
        $(e.currentTarget)
          .addClass('is-hidden')
          .remove();
      } else {
        $(e.target)
          .parent()
          .addClass('is-hidden')
          .remove();
      }
    });
  },
  dismissNotification: () => {
    $('.footer-notification').on('click', e => {
      // before we delete anything, check to see if this is the last alert
      $(e.currentTarget)
        .addClass('is-hidden')
        .remove();
    });
  },
  replyToRequest: () => {
    $('#request-container').on('click', e => {
      // currentTarget is where the listener is attached
      // target is the actual click target
      const clickTarget = $(e.target);
      // If we clicked a button
      if (clickTarget.hasClass('request-button')) {
        // Get the first parent with the class 'card'
        // and find its data-id
        const reqID = clickTarget.closest('.card').attr('data-id');
        // Initiate AJAX request OR pop up a modal!
        // Add an event listener to logo watch for clicks
        $('#request-modal').toggleClass('is-active');
        // Set the modal header
        $('#request-modal .modal-card-title').text(`${clickTarget.text()} Request`);
        // Change the span text
        $('#request-modal .response-type').text(`${clickTarget.text().toLowerCase()}`);
        // Finally, set the data ID of the buttons to the ID from the card, so
        // we can process the request in a separate event listener.
        $('#request-modal .response-button').attr('data-id', reqID);
        // Also set a data attribute on the buttons to make sure we're
        // corresponding to the correct button originally clicked, approve or
        // deny
        $('#request-modal .response-button').attr('data-type', clickTarget.text().toLowerCase());
        // Depending on which we clicked, hide one of the two control buttons
        // Default is UNhidden, so we'll hide the one NOT being used
        // That way we can always removeClass upon modal close
        // This will stop classes from accumulating accidentally?
        if (clickTarget.text().toLowerCase() === 'deny') {
          $('#request-modal #approve-request').addClass('is-hidden');
        } else if (clickTarget.text().toLowerCase() === 'approve') {
          $('#request-modal #deny-request').addClass('is-hidden');
        }
      }
    });
  },
  watchModal: () => {
    $('#request-modal').on('click', e => {
      // If the background, close, or cancel buttons were clicked...
      if (
        $(e.target).hasClass('delete') ||
        $(e.target).hasClass('modal-background') ||
        $(e.target).hasClass('cancel')
      ) {
        // toggle the 'is-active' class from the modal
        $('#request-modal').toggleClass('is-active');
        // and unhide both buttons
        $('#request-modal #approve-request').removeClass('is-hidden');
        $('#request-modal #deny-request').removeClass('is-hidden');
      } else if ($(e.target).hasClass('response-button')) {
        // Add button loading style
        $(e.target).addClass('is-loading');
        // Set up boolean value for inline ternary conditional. We want to know
        // whether request was approved or denied. If the request was approved,
        // then $(e.target).attr('data-type') === 'approve'; will be TRUE, and
        // approval will be true. If it is denied, then
        // $(e.target).attr('data-type') === 'approve'; will be false, and
        // approval will be false.
        const approval = $(e.target).attr('data-type') === 'approve';
        // Send ajax request
        $.ajax({
          type: 'POST',
          url: 'requests/respond',
          data: {
            id: $(e.target).attr('data-id'),
            message: $('#request-modal input[name="message"]').val(),
            // If approval = true, type will be 'approved'.
            // If approval = false, type will be 'denied'
            type: approval ? 'approved' : 'denied'
          },
          // handle successes!
          success: () => {
            //    (res)
            window.location.reload();
          },
          // handle errors
          error: err => {
            console.log(err);
            // window.location.reload();
          }
        });
      }
    });
  }
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  // handlers.deleteArticle();
  handlers.dismissMessagesNotification();
  handlers.dismissNotification();
  handlers.updateEntry();
  handlers.replyToRequest();
  handlers.watchModal();
});
