import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function MainPage() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);// Track the joined group
  const [isPartOfGroup, setIsPartOfGroup] = useState(false); // Track if the user is part of a group
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://88.200.63.148:7777/subscriptions/types')
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error('Failed to fetch services:', err));
  }, []);

  const fetchGroups = (typeId) => {
    fetch(`http://88.200.63.148:7777/subscriptions/groups/${typeId}`, {
      credentials: 'include', // Include cookies to maintain the session
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGroups(data.groups);
          setIsPartOfGroup(data.isPartOfGroup); // Update isPartOfGroup state
        }
      })
      .catch(err => console.error('Failed to fetch groups:', err));
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    fetchGroups(service.type_id);
  };

  const closeModal = () => setSelectedService(null);

  const joinGroup = (groupId, groupName) => {
    fetch('http://88.200.63.148:7777/subscriptions/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies to maintain the session
      body: JSON.stringify({ groupId }), // Only send groupId
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsPartOfGroup(true); // Update the group status
          navigate('/payment'); // Redirect to payment page
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Failed to join group:', err));
  };

  const createGroup = () => {
    fetch('http://88.200.63.148:7777/subscriptions/groups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies to maintain the session
      body: JSON.stringify({ groupName: newGroupName, typeId: selectedService.type_id }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('Group created successfully');
          setCreatingGroup(false);
          fetchGroups(selectedService.type_id);
        } else {
          alert(data.message);
        }
      })
      .catch(err => console.error('Failed to create group:', err));
  };

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>Available Subscriptions</h1>
        <button className="auth-button" onClick={() => navigate('/profile')}>My Profile</button>
      </header>
      <main className="flashcards-container">
        {services.map((service) => (
          <div
            key={service.type_id}
            className="flashcard"
            onClick={() => handleServiceClick(service)}
          >
            {service.icon_image && (
              <img
                src={service.icon_image}
                alt={`${service.service_name} icon`}
                className="service-icon"
                style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 8 }}
              />
            )}
            <h2>{service.service_name}</h2>
            <p>€{service.cost}/month</p> {/* Display the cost */}
          </div>
        ))}
      </main>

      {selectedService && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={closeModal}>×</button>
            <h2>{selectedService.service_name}</h2>
            <p>{selectedService.description}</p>

            <h3>Available Groups</h3>
            <div className="groups-container">
              {groups.map(group => (
                <div key={group.g_id} className="group-box">
                  <p><strong>Group Name:</strong> {group.name}</p>
                  <p><strong>Members:</strong> {group.member_count}/4</p>
                  <button
                    className="submit-button"
                    onClick={() => joinGroup(group.g_id, group.name)}
                    disabled={group.isMember || isPartOfGroup} // Disable if already a member or part of another group
                  >
                    {group.isMember ? 'Already Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </div>

            <button
              className="submit-button"
              onClick={() => setCreatingGroup(true)}
              disabled={isPartOfGroup} // Disable if already part of a group
            >
              Create Your Own Group
            </button>
          </div>
        </div>
      )}

      {creatingGroup && (
        <div className="login-modal">
          <div className="login-frame">
            <button className="close-button" onClick={() => setCreatingGroup(false)}>×</button>
            <h2>Create a New Group</h2>
            <input
              className="login-input"
              type="text"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button className="submit-button" onClick={createGroup}>Create Group</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;