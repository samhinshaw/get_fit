const handlers = {
  // Function 1 to listen for: hamburger menu
  toggleNavBarBurger: () => {
    // Get all "navbar-burger" elements
    const navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
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
  }
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  // handlers.deleteArticle();
  handlers.dismissMessagesNotification();
  handlers.dismissNotification();
  handlers.updateEntry();
});
