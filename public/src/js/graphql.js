import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';
import Cookies from 'js-cookie';

const client = new Lokka({
  transport: new Transport(`${window.location.origin}/graphql`)
});

const username = Cookies('username');

// gotta figure out how to inject the cookie's username in here

const queryUsers = `
{
  users {
    firstname
  }
}
`;

if (username) {
  client.query(queryUsers).then(result => {
    console.log(result);
    // Log the result
    // const user = result.users[0].firstname;
    // const partner = result.users[1].firstname;
    // $('#userName').html(user.charAt(0).toUpperCase() + user.slice(1));
    // $('#partnerName').html(partner.charAt(0).toUpperCase() + partner.slice(1));
  });
}

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
