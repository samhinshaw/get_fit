import { Lokka } from 'lokka';
import { Transport } from 'lokka-transport-http';

const client = new Lokka({
  transport: new Transport(`${window.location.origin}/graphql`)
});

const hiQuery = `
  {
    hi
  }
`;

const queryEntries = `
{
  entries {
    _id
    netCals
  }
}
`;

// Hello

client.query(hiQuery).then(result => {
  // Log the result
  console.log(result);
  // Then change the HTML
  // $('#userTitle').html(result.hi);
  $('#userTitle').animate({ opacity: 0 }, 200, () => {
    $('#userTitle')
      .html(result.hi)
      .animate({ opacity: 1 }, 200);
  });
});

client.query(queryEntries).then(result => {
  // Log the result
  console.log(result);
});
