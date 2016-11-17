# DeskPATCHer
Takes information from Modulus API and PATCHes it to Salesforce Desk customer record

### Create new Node.js project on Modulus.io
Create project. Set 192MB servo. Add environmental variables: TOKEN, Authorization, Credentials.

Deploy this code to the newly created Node.js project.

### Add integration URL in Salesforce Desk
Go to: Admin, Cases, Integration URLs
Integration URL should look like this:

`https://<project-name-12356>.onmodulus.net?ticketId={{case.id}}&email={{case.customer.email}}&customerId={{customer.id}}`

