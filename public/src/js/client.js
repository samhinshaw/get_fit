// Import statements will go here, webpack & Babel will take care of the rest
// Import JQuery for all of this to work!
import 'jquery';
import tippy from 'tippy.js';
// Import styles for webpack (specifically, webpack-extract-text-plugin)
import '../sass/styles.sass';
import '../css/styles.css';
// Run GraphQL script

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
  updateEntry: () => {
    // UPDATE THIS to listen for click within column, not for click on each button
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
        success: res => {
          console.log(res);
          window.location.reload();
        },
        // handle errors
        error: err => {
          $(e.currentTarget).removeClass('is-loading');
          $('#notification-entry').append(
            `
              <div class="messages">
                <div class="notification landing-page-notification is-${err.responseJSON.type}">
                  <button class="delete"></button>
                  <p>${err.responseJSON.message}</p>
                </div>
              </div>
            `
          );
          // Since we're creating a new .messages div, (after DOMContentLoaded
          // fired) there's no event handler yet! So we gotta make sure we add
          // it again.
          handlers.dismissMessagesNotification();
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
    $('.footer-notification, .landing-page-notification ').on('click', e => {
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
  },
  resetForm: () => {
    $('#cancel-account-settings').on('click', e => {
      document.getElementById('account-settings').reset();
    });
  },
  participateWithPartner: () => {
    // When checkbox is toggled (JQuery detects keyboard too by default)
    $('#withPartner').on('click', e => {
      // If the checkbox is now checked
      if ($('#withPartner').is(':checked')) {
        // Make username field visible
        $('#partnerUsernameLabel').removeClass('is-hidden');
        $('#partnerUsername').removeClass('is-hidden');
      } else {
        // Doesn't really matter if this gets added multiple times, because
        // removeClass will remove multiple instances at once.
        $('#partnerUsername').addClass('is-hidden');
        $('#partnerUsernameLabel').addClass('is-hidden');
        // Also clear username value
        $('#partnerUsername').val('');
      }
    });
  },
  invitePartnerByEmail: () => {
    // make visible
    $('#partnerEmail').removeClass('is-hidden');
    // hide
    $('#partnerEmail').addClass('is-hidden');
    // Also clear value
    $('#partnerEmail').val('');
  },
  validateRegistration: {
    addValidationMarkup: function(target, name, type, message) {
      this.clearValidationMarkup(target, name);
      $(target).addClass(`is-${type}`);
      // This is better than ('.control').after, because it accounts for
      // multiple .controls
      $(target).closest('.field').append(`
      <p id="${name}Validation" class="help is-${type}">${message}</p>
      `);
    },
    clearValidationMarkup: function(target, name) {
      $(target).removeClass('is-success');
      $(target).removeClass('is-danger');
      $(`#${name}Validation`).remove();
    },
    checkFields: function() {
      let delayedAction;
      const route = window.location.pathname;
      $('.validated-input').change(e => {
        clearTimeout(delayedAction);
        const payload = {
          name: e.currentTarget.name,
          value: e.currentTarget.value
        };
        delayedAction = setTimeout(() => {
          // If we're querying checking password, don't need to leave client-side!
          if (payload.name === 'passwordConfirm') {
            const password = $('#password').val();
            if (payload.value.length < 5 || password.length < 5) {
              this.addValidationMarkup(
                e.currentTarget,
                payload.name,
                'danger',
                'Your password must be at least 5 characters.'
              );
            } else if (password === payload.value) {
              this.addValidationMarkup(
                e.currentTarget,
                payload.name,
                'success',
                'These passwords match.'
              );
            } else {
              this.addValidationMarkup(
                e.currentTarget,
                payload.name,
                'danger',
                'These passwords do not match.'
              );
            }
          } else {
            $.ajax({
              type: 'POST',
              url: `${route}/validate`,
              dataType: 'json',
              data: payload,
              // handle successes!
              success: res => {
                this.addValidationMarkup(e.currentTarget, payload.name, res.classType, res.message);
              },
              // handle errors
              error: err => {
                if (err) console.log(err);
              }
            });
          }
        }, 500);
      });
    },
    findPartnerByUsername: function() {
      $('#findPartnerByUsername').on('click', e => {
        const route = window.location.pathname;
        const target = $('#partnerUsername input[name="partner"]')[0];
        const username = $('#partnerUsername input[name="partner"]').val();
        const payload = {
          name: 'partner',
          value: username
        };
        $.ajax({
          type: 'POST',
          url: `${route}/validate`,
          dataType: 'json',
          data: payload,
          // handle successes!
          success: res => {
            this.addPartnerEmailField(target, payload.name, res.classType, res.message);
          },
          // handle errors
          error: err => {
            if (err) console.log(err);
          }
        });
      });
    },
    addPartnerEmailField: function(target, name, type, message) {
      this.clearPartnerEmailField(target, name);
      $(target).addClass(`is-${type}`);
      // For this weird field, we actually want the help text after!
      $(target).closest('.field').after(`
      <p id="${name}Validation" class="help is-${type}">${message}</p>
      `);
    },
    clearPartnerEmailField: function(target, name) {
      $(target).removeClass('is-success');
      $(target).removeClass('is-danger');
      $(`#${name}Validation`).remove();
    }
  }
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  // console.log(window.location);
  // Could theoretically enable/diable these based on pathname to limit number
  // of event listeners on a page
  handlers.toggleNavBarBurger();
  handlers.dismissMessagesNotification();
  handlers.dismissNotification();
  handlers.updateEntry();
  handlers.replyToRequest();
  handlers.watchModal();
  handlers.resetForm();
  if (window.location.pathname === '/register') {
    handlers.participateWithPartner();
    handlers.validateRegistration.checkFields();
    handlers.validateRegistration.findPartnerByUsername();
  }
  tippy('#helpToolTipButton', { placement: 'right', trigger: 'click' });
});
