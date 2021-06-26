document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


  //sending emails
  document.querySelector('#compose-form').onsubmit = ()=>{

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(() => {
      load_mailbox('sent');
    });
    return false
  }

}
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // loop all emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      show_mailbox(email, mailbox)
    });
  });
  
}

//format for each email line
function show_mailbox(email, mailbox) {
  const email_container = document.createElement('div');
  const date = document.createElement('p');
  const subject = document.createElement('p');
  const useremail = document.createElement('p');
  
  date.innerHTML = email.timestamp;
  subject.innerHTML = email.subject;
  if (mailbox === "sent"){
    useremail.innerHTML = email.recipients;
  } else {
    useremail.innerHTML = email.sender;
  };
  
  email_container.append(useremail, subject, date);

  document.querySelector('#emails-view').append(email_container);
  
  email_container.addEventListener('click', () => {
    email_detail(email.id);
  });
  
  
  //all class
  email_container.classList.add(
    "d-flex", 
    "flex-row",
    "pt-2",
    "mb-0",
    "pl-2", 
    "border", 
    "border-primary",
    "list-group-item",
    "list-group-item-action", 
    "email_container"
    );
  if (email.read) {
    email_container.classList.add(
      "bg-light",
      "text-muted",
    )
  } else {
    email_container.classList.add(
      "bg-white",
      "text-dark",
    )
  }
  useremail.classList.add(
    "font-weight-bold",
    "mr-4", 
    "mb-1"
    );
  subject.classList.add(
    "mb-1"
    );
  date.classList.add(
    "font-weight-light",
    "text-secondary",
    "ml-auto",
    "mb-1",
    "mr-2"
    );

  
  
}

//email loading event
function email_detail(email_id) {

  document.querySelector('#emails-view').innerHTML="";

  fetch(`/emails/${email_id}`,)
  .then(response => response.json())
  .then(email => { 
    console.log(email);
    email_format(email);
  });

  //read function
  fetch(`/emails/${email_id}`,{
    method:'PUT',
    body:JSON.stringify({
      read: true,
    })
  })
  
}

//email format
function email_format(email) {
  const emaildetail_container = document.createElement('div');
  const emailheader_container = document.createElement('div');
  const sender = document.createElement('p');
  const recipients = document.createElement('p');
  const subject = document.createElement('p');
  const body = document.createElement('p');
  const date = document.createElement('p');
  const archive = document.createElement('button');
  const reply = document.createElement('button');
  

  sender.innerHTML = (`<strong>From</strong>:  ${email.sender}`);
  recipients.innerHTML = (`<strong>To</strong>:  ${email.recipients}`);
  subject.innerHTML = (`<strong>Subject</strong>: ${email.subject}`);
  body.innerHTML = email.body;
  date.innerHTML = (`<strong>Time</strong>: ${email.timestamp}`);
  reply.innerHTML = "Reply";
  if (email.archived) {
    archive.innerHTML = "Unarchive";
  } else {
    archive.innerHTML = "Archive";
  }
  
  emaildetail_container.append(body);
  emailheader_container.append(sender,recipients,date,subject,reply,archive);

  document.querySelector('#emails-view').append(emailheader_container, emaildetail_container);
  
  

  //all class
  emailheader_container.classList.add(
    "border-bottom",
    "px-2",
    "pb-4",
  )
  emaildetail_container.classList.add(
    "px-2",
    "py-4",
  )
  reply.classList.add(
    "btn",
    "btn-primary",
    "mr-2",
  )
  if (email.archived) {
    archive.classList.add(
      "btn",
      "btn-secondary",
      "unarchive_button",
    )
  } else {
    archive.classList.add(
      "btn",
      "btn-outline-danger",
      "archive_button",
    )
  }

  //both buttons
  archive.addEventListener('click', ()=> archiveFunction(email.id, email.archived));
  reply.addEventListener('click', () => replyFunction(email))
  
  
}

//archive function
function archiveFunction(email_id,email_archived) {
  fetch(`/emails/${email_id}`,{
    method:'PUT',
    body:JSON.stringify({
      archived: !email_archived,
    })
  })
  .then (()=>load_mailbox('inbox'));
}

//reply function
function replyFunction(email) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = `${email.sender}`;
  document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  document.querySelector('#compose-body').value = (`>On ${email.timestamp} ${email.sender} wrote : ${email.body}<`);

  document.querySelector('#compose-form').onsubmit = ()=>{

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(() => {
      load_mailbox('sent');
    });
    return false
  }
}