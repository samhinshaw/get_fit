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
      navbarBurgers.forEach((element) => {
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
  deleteArticle: () => {
    $('.delete-article').on('click', (event) => {
      $target = $(event.target);
      const id = $target.attr('data-id');
      $.ajax({
        type: 'DELETE',
        url: `/data/${id}`,
        success: (res) => {
          alert('Deleting Article');
          window.location.href = '/';
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  },
  updateEntry: () => {
    $('.update-entry').on('click', (event) => {
      // Get the Dates
      // const id = $(event.target).attr('data-id');
      const date = $(event.currentTarget).attr('data-date');
      // set current subroute based on location. So we'll post to sam if we're on /sam
      const route = window.location.pathname;
      // Add the loading class
      $(event.currentTarget).addClass('is-loading');
      // $(event.currentTarget)
      //   .find('i')
      //   .addClass('fa-spin');
      // Make the AJAX request to update the entry
      $.ajax({
        type: 'POST',
        url: `${route}/${date}`,
        // handle successes!
        success: (res) => {
          window.location.reload();
        },
        // handle errors
        error: (err) => {
          console.log(err);
          window.location.reload();
        }
      });
    });
  },
  dismissNotification: () => {
    $('.messages').on('click', (event) => {
      // before we delete anything, check to see if this is the last alert
      if (
        $(event.target)
          .parent()
          .siblings().length === 0
      ) {
        // if it's the last alert, remove the entire .messages section
        $(event.currentTarget)
          .addClass('is-hidden')
          .remove();
      } else {
        $(event.target)
          .parent()
          .addClass('is-hidden')
          .remove();
      }
    });
  }
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  handlers.deleteArticle();
  handlers.dismissNotification();
  handlers.updateEntry();
});
