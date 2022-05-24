document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email() {

  // Post email to API route
  fetch('/emails' , {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(result => {
    // Print result
    console.log(result)})
   //load inbox sent page 
  .then(response => load_mailbox('sent'));
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  view = document.querySelector('#emails-view');
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Get latest emails according to mailbox
    fetch('/emails/'+ mailbox)
    .then(response => response.json())
    .then(emails => {
  
      // generate div for each email
      emails.forEach(email => {
          let div = document.createElement('div');

          //set div class based on read status
          if (email.read === true) {
            div.setAttribute("class", "read-email");
          }
          else if (email.read === false) {
            div.setAttribute("class", "unread-email");
          }
          else{
            console.log("Error retrieving read status");
          }

          div.innerHTML = `
              Sender : <b>${email.sender}</b><br>
              Subject : ${email.subject}<br>
              Date : ${email.timestamp}<br><br>
          `;

          //make div clickable
          div.addEventListener('click', () => load_email(email.id));
          
          view.appendChild(div);
      });
    })
  }
  
    
function load_email(id) {

    // Show the email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // Get email according to id
    fetch('/emails/'+ id)
    .then(response => response.json())
    .then(email => {

      //Mark email as read
      if(!email.read){
        fetch('/emails/'+ id, {
          method: 'PUT',
          body: JSON.stringify({ read : true })
        })
      }
      
      //set email view to email contents
      document.querySelector('#email-view').innerHTML = `
              Sender : <b>${email.sender}</b><br>
              Recipients : <b>${email.recipients}</b><br>
              Date : ${email.timestamp}<br>
              Subject : ${email.subject}<br>
              Body : ${email.body}<br><br>
          `;
    

    // create new button
    unreadButton = document.createElement('button');
    unreadButton.className = "btn btn-sm btn-outline-primary";
    unreadButton.innerHTML = "Mark as Unread"

    //mark email as unread when clicked
    unreadButton.addEventListener('click', function() {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : false })
      })
      .then(response => load_mailbox('inbox'))
    })

    document.querySelector('#email-view').appendChild(unreadButton);
  });

}