import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

const client = new Lokka({
  transport: new Transport(`${window.location.origin}/graphql`)
});

const queryEntries = `
{
  users {
    firstname
  }
}

`;

// Hello

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

client.query(queryEntries).then(result => {
  console.log(result);
  // Log the result
  // const user = result.users[0].firstname;
  // const partner = result.users[1].firstname;
  // $('#userName').html(user.charAt(0).toUpperCase() + user.slice(1));
  // $('#partnerName').html(partner.charAt(0).toUpperCase() + partner.slice(1));
});
