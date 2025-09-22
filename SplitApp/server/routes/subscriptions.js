const express = require("express");
const subscriptions = express.Router();
const DB = require('../db/dbConn.js');

subscriptions.get('/types', async (req, res) => {
  try {
    let result = await DB.getAllSubscriptionTypes();
    result = result.map(row => ({
      ...row,
      icon_image: row.icon_image
        ? `data:image/png;base64,${Buffer.from(row.icon_image).toString('base64')}`
        : null
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

subscriptions.get('/user', async (req, res) => {
  const userId = req.session.userId; // Retrieve userId from session

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const subscriptions = await DB.GetUserSubscriptions(userId);
    console.log('Fetched subscriptions:', subscriptions); // Debug log
    res.json({ success: true, subscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
  }
});

subscriptions.get('/groups/:typeId', async (req, res) => {
  const { typeId } = req.params;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // Check if the user is already part of a group for this service
    const isPartOfGroup = await DB.isUserPartOfGroup(typeId, userId);

    // Fetch groups for the given typeId
    const groups = await DB.getGroupsByTypeId(typeId, userId);

    res.json({ success: true, groups, isPartOfGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
});

subscriptions.post('/groups/join', async (req, res) => {
  const { groupId } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User is not logged in. Please log in again.' });
  }

  try {
    await DB.joinGroup(groupId, userId);
    res.json({ success: true, message: 'Successfully joined the group' });
  } catch (error) {
    console.error(error);
    if (error.message === 'Group is full') {
      res.status(400).json({ success: false, message: 'Group is full' });
    } else if (error.message === 'User is already a member of this group') {
      res.status(400).json({ success: false, message: 'You are already a member of this group' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to join the group' });
    }
  }
});

subscriptions.post('/groups/create', async (req, res) => {
  const { groupName, typeId } = req.body; // Get groupName and typeId from the request body
  const userId = req.session.userId; // Get userId from the session

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const groupId = await DB.createGroup(groupName, userId, typeId);
    res.json({ success: true, message: 'Group created successfully', groupId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create the group' });
  }
});

subscriptions.post('/unsubscribe', async (req, res) => {
  let { typeId, serviceName } = req.body; // Get typeId or serviceName from the request body
  const userId = req.session.userId; // Get userId from the session

  console.log('Received typeId:', typeId); // Debug log
  console.log('Received serviceName:', serviceName); // Debug log
  console.log('User ID from session:', userId); // Debug log

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    // If typeId is not provided, fetch it using the service name
    if (!typeId && serviceName) {
      console.log('Fetching typeId using serviceName...');
      const result = await DB.getTypeIdByServiceName(serviceName);
      if (result.length > 0) {
        typeId = result[0].type_id;
        console.log('Fetched typeId:', typeId); // Debug log
      } else {
        return res.status(400).json({ success: false, message: 'Invalid service name' });
      }
    }

    if (!typeId) {
      return res.status(400).json({ success: false, message: 'Missing typeId or serviceName' });
    }

    // Call DB method to handle unsubscription
    await DB.unsubscribeUserFromService(typeId, userId);
    res.json({ success: true, message: 'Successfully unsubscribed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to unsubscribe' });
  }
});

module.exports = subscriptions;