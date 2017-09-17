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
      navbarBurgers.forEach((el) => {
        el.addEventListener('click', () => {
          // Get the target from the "data-target" attribute
          let target = el.dataset.target;
          target = document.getElementById(target);

          // Toggle the class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          target.classList.toggle('is-active');
        });
      });
    }
  },
  deleteArticle: () => {
    $('.delete-article').on('click', (e) => {
      $target = $(e.target);
      const id = $target.attr('data-id');
      $.ajax({
        type: 'DELETE',
        url: `/article/${id}`,
        success: (res) => {
          alert('Deleting Article');
          window.location.href = '/';
        },
        error: (err) => {
          console.log(err);
        }
      });
    });
  }
};

// Process all actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  handlers.toggleNavBarBurger();
  handlers.deleteArticle();
});
