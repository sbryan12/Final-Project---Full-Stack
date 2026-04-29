
// Base URL for all API requests
// In production, change this to your live domain e.g. 'https://yoursite.com/api'
const API_URL = 'https://final-project-full-stack-ehqc.onrender.com/api' // dont forget to change this later --- after deploy change to e.g http://render/api

// ===== PROTECT THE PAGE =====
// Read the token that was saved to localStorage when the user logged in
const token = localStorage.getItem('token')

// If there is no token, the user is not logged in — send them back to the login page
if (!token) {
  window.location.href = 'index.html'
  throw new Error('No token') // stops the rest of the script from running

}

// ===== AUTH HEADER HELPER =====
// Every request to a protected route must include the JWT token in the Authorization header
// This function returns the headers object so we don't repeat it everywhere
function authHeader() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // format required by our authMiddleware.js
  }
}

// ===== LOGOUT =====
// When logout is clicked, remove the token from localStorage and go back to login
// Without the token, the user can no longer make authenticated requests
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token')
  window.location.href = 'index.html'
})

// ===== GET ALL Services =====
async function getServices() {
  // GET /api/notes — protected route, needs Authorization header
  const res = await fetch(`${API_URL}/services`, {
    method: 'GET',
    headers: authHeader()
  })

  const services = await res.json()

  if (!res.ok) {
    // If the request failed, show the error in the notes container
    document.getElementById('serviceList').textContent = services.message || 'Failed to load notes'
    return
  }

  // Pass the notes array to the render function to display them on the page
  renderServices(services)
}

// ===== RENDER Services TO THE PAGE =====
function renderServices(services) {
  const container = document.getElementById('serviceList')

  // Clear whatever was previously rendered so we don't get duplicates
  container.innerHTML = ''

  if (services.length === 0) {
    container.textContent = 'No notes yet. Add one above!'
    return
  }

  // Loop through each service and create HTML elements for it
  services.forEach(service => {
    const div = document.createElement('div')
    div.className = 'serviceCard'
    div.innerHTML = `
      <p><strong>ID:</strong> ${service.id}</p>
      <p>Service Title: ${service.service_title}</p>
      <p>Price: $${service.price}</p>
      <p>Discount: ${service.discount ? 'Yes' : 'No'}</p>
      <p>Duration[in days]: ${service.duration}</p>
      <p>Description: ${service.description}</p>
      <p>Added by: ${service.username ? service.username : 'admin'}</p>
      <button id="editBtn" onclick="startEdit('${service._id}', '${service.service_title}', '${service.price}', '${service.discount}', '${service.duration}', '${service.description}')">Edit</button>
      <button id="deleteBtn" onclick="deleteService('${service._id}')">Delete</button>
    `
    container.appendChild(div)
  })
}

// ===== CREATE A Service =====
document.getElementById('createServiceForm').addEventListener('submit', async (e) => {
  // Prevent page refresh on form submit
  e.preventDefault()

  const id = document.getElementById('idText').value
  const service_title = document.getElementById('service_titleText').value
  const price = document.getElementById('priceText').value
  const discount = document.getElementById('discountText').value
  const duration = document.getElementById('durationText').value
  const description = document.getElementById('descriptionText').value

  // POST /api/notes — sends the service text in the request body
  const res = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: authHeader(),
    body: JSON.stringify({ id, service_title, price, discount, duration, description })
  })

  const data = await res.json()

  if (!res.ok) {
    // Show the error (e.g. "Please add a 'text' field")
    document.getElementById('createMsg').style.color = 'red'
    document.getElementById('createMsg').textContent = data.message || 'Failed to create service'
    return
  }

  // Show success message, clear the input, and refresh the services list
  document.getElementById('createMsg').style.color = 'green'
  document.getElementById('createMsg').textContent = 'Service created!'
  document.getElementById('service_titleText').value = ''
  getServices()
})

// ===== DELETE A Service =====
async function deleteService(id) {
  // Ask the user to confirm before permanently deleting
  const confirmed = confirm('Are you sure you want to delete this service?')
  if (!confirmed) return

  // DELETE /api/services/:id — the id is in the URL, no request body needed
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: authHeader()
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.message || 'Failed to delete service')
    return
  }

  // Refresh the list so the deleted note disappears
  getServices()
}

// ===== SHOW EDIT FORM =====
// Called when the user clicks the Edit button on a note
// Populates the hidden edit section with the current service id and text
function startEdit(id, service_title, price, discount, duration, description) {
  document.getElementById('editSection').style.display = 'block'
  document.getElementById('editserviceId').value = id         // store id in hidden input
  document.getElementById('editservice_titleText').value = service_title // pre-fill with current text
  document.getElementById('editpriceText').value = price
  document.getElementById('editdiscountText').value = discount
  document.getElementById('editdurationText').value = duration
  document.getElementById('editdescriptionText').value = description                                                                       
  document.getElementById('editMsg').textContent = ''       // clear any previous messages
  // Scroll the edit section into view so the user doesn't have to scroll manually
  document.getElementById('editSection').scrollIntoView()
}

// ===== CANCEL EDIT =====
// Hide the edit form without making any changes
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  document.getElementById('editSection').style.display = 'none'
})

// ===== SAVE EDIT =====
document.getElementById('saveEditBtn').addEventListener('click', async () => {
  // Read the service id (from the hidden input) and the updated text
  const id = document.getElementById('editserviceId').value
  const service_title = document.getElementById('editservice_titleText').value
  const price = document.getElementById('editpriceText').value
  const discount = document.getElementById('editdiscountText').value
  const duration = document.getElementById('editdurationText').value
  const description = document.getElementById('editdescriptionText').value


  // PUT /api/notes/:id — sends the updated text in the request body
  const res = await fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: JSON.stringify({ id, service_title, price, discount, duration, description })
  })

  const data = await res.json()

  if (!res.ok) {
    document.getElementById('editMsg').style.color = 'red'
    document.getElementById('editMsg').textContent = data.message || 'Failed to update service'
    return
  }

  // Show success, hide the edit form, and refresh the notes list
  document.getElementById('editMsg').style.color = 'green'
  document.getElementById('editMsg').textContent = 'Service updated!'
  getServices()
  document.getElementById('editSection').style.display = 'none'
})

// ===== LOAD NOTES ON PAGE LOAD =====
// Automatically fetch and display all notes when dashboard.html is opened
getServices()