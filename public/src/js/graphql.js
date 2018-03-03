// Import Lokka, our front-end graphql client of choice
import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
// Also handle cookies with express/js-cookie
// import Cookies from 'js-cookie';
// Set up Lokka HTTP Transport to send queries to /graphql
const client = new Lokka({
  transport: new Transport(`${window.location.origin}/graphql`)
});

const templateFixer = `fixing template literal highlighting in graphql.js`;
console.log(templateFixer);

/*= ============================================
=                  Get Cookies!                =
============================================= */

// const username = Cookies('username');

// Way to handle if cookie not found
// const handleCookies = async (cookieName, cb, args) => {
//   let username = await Cookies(cookieName);
//   if (!username) {
//     const response = await fetch(`${window.location.origin}/api/user_data`, {
//       credentials: 'same-origin'
//     });
//     const json = await response.json();
//     username = json.username;
//   }
//   cb(username, args);
// };

// handleCookies('username', console.log);

/*= ============================================
=              Make Actual Queries!            =
============================================= */

const userQuery = `
{
  users {
    username
  }
}
`;

// Watch a Query to allow for refetching
const watchUserHandler = (err, payload) => {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log('All Users: ', payload);
};
const stop = client.watchQuery(userQuery, watchUserHandler);
// stop watching after a minute
setTimeout(stop, 1000 * 60);

const createUser = `
  ($username: String!) {
    createUser(username: $username) {
      username
      lastname
      currentPoints
    }
  }
`;

const createTestUser = () => {
  $('#createUser').on('click', () => {
    const usernameInput = $('#username').val();
    client
      .mutate(createUser, {
        username: usernameInput
      })
      .then(data => {
        // Log the result
        console.log(data);
        // fire the refetch set above
        client.refetchQuery(userQuery);
        // Then change the HTML
        // $('#userTitle').html(result.hi);
        // $('#userTitle').animate({ opacity: 0 }, 200, () => {
        //   $('#userTitle')
        //     .html(result.hi)
        //     .animate({ opacity: 1 }, 200);
        // });
      })
      .catch(error => console.log(error));
  });
};

// Process all DOM actions after DOM content has loaded
document.addEventListener('DOMContentLoaded', () => {
  createTestUser();
});

// Example of cookie handling:
// const queryUsers = (user, query) => {
//   client.query(query).then(result => {
//     console.log('Current User: ', user);
//     console.log(result);
//     // Log the result
//     // const user = result.users[0].firstname;
//     // const partner = result.users[1].firstname;
//     // $('#userName').html(user.charAt(0).toUpperCase() + user.slice(1));
//     // $('#partnerName').html(partner.charAt(0).toUpperCase() + partner.slice(1));
//   });
// };

// handleCookies('username', queryUsers, userQuery);

// client.query(entryQuery).then(result => {
//   // console.log('Current User: ', username);
//   console.log('All Users:', result);
//   // Log the result
//   // const user = result.users[0].firstname;
//   // const partner = result.users[1].firstname;
//   // $('#userName').html(user.charAt(0).toUpperCase() + user.slice(1));
//   // $('#partnerName').html(partner.charAt(0).toUpperCase() + partner.slice(1));
// });

// client.query(hiQuery).then(result => {
//   // Log the result
//   console.log(result);
//   // Then change the HTML
//   // $('#userTitle').html(result.hi);
//   $('#userTitle').animate({ opacity: 0 }, 200, () => {
//     $('#userTitle')
//       .html(result.hi)
//       .animate({ opacity: 1 }, 200);
//   });
// });

// client
//   .query(createUser, {
//     name: 'createUser'
//   })
//   .then(result => {
//     // Log the result
//     console.log(result);
//     // Then change the HTML
//     // $('#userTitle').html(result.hi);
//     // $('#userTitle').animate({ opacity: 0 }, 200, () => {
//     //   $('#userTitle')
//     //     .html(result.hi)
//     //     .animate({ opacity: 1 }, 200);
//     // });
//   });
