const express = require('express');
const mysql = require('mysql2');

const  conn = mysql.createConnection({
    host: "localhost",
    user: "studenti",
    password: "S039C8R7",
    database: 'SISIII2025_89231170',
  })
  
conn.connect((err) => {
      if(err){
          console.log("ERROR: " + err.message);
          return;   
      }
      console.log('Connection established');
    })

let dataPool={}

dataPool.AuthUser = (username, password) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT * FROM User WHERE user_name = ? AND password = ?',
      [username, password],
      (err, res, fields) => {
        if (err) { return reject(err); }
        return resolve(res);
      }
    );
  });
};

dataPool.RegisterUser = (user_name, email, password) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'INSERT INTO User (user_name, email, password) VALUES (?, ?, ?)',
      [user_name, email, password],
      (err, res, fields) => {
        if (err) { return reject(err); }
        return resolve(res);
      }
    );
  });
};

dataPool.GetUserProfile = (username) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT user_name, email, password FROM User WHERE user_name = ?',
      [username],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.UpdateUserProfile = (username, email, address) => {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE User SET email = ?, password = ? WHERE user_name = ?',
      [email, address, username],
      (err, res) => {
        if (err) return reject(err);
        resolve(res);
      }
    );
  });
};

dataPool.getAllSubscriptionTypes = () => {
  return new Promise((resolve, reject) => {
    conn.query(
      'SELECT type_id, service_name, description, cost, icon_image FROM SubscriptionTypeList',
      (err, res, fields) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      }
    );
  });
};

dataPool.GetUserSubscriptions = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT st.service_name, st.cost, s.billing_date
      FROM Subscription s
      JOIN SubscriptionTypeList st ON s.type_id = st.type_id
      JOIN Group_members gm ON gm.g_id = s.group_id
      WHERE gm.u_id = ?;
    `;
    conn.query(query, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

dataPool.getGroupsByTypeId = (typeId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT g.g_id, g.name, COUNT(gm.u_id) AS member_count,
        EXISTS (
          SELECT 1 FROM Group_members gm WHERE gm.g_id = g.g_id AND gm.u_id = ?
        ) AS isMember
      FROM \`Group\` g
      LEFT JOIN Group_members gm ON g.g_id = gm.g_id
      WHERE g.g_id IN (
        SELECT group_id FROM Subscription WHERE type_id = ?
      )
      GROUP BY g.g_id, g.name;
    `;
    conn.query(query, [userId, typeId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

dataPool.createGroup = (groupName, userId, typeId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Creating group: groupName=${groupName}, userId=${userId}, typeId=${typeId}`); // Debug log

      // Insert the group
      const groupId = await new Promise((resolve, reject) => {
        const insertGroupQuery = `INSERT INTO \`Group\` (name) VALUES (?);`;
        conn.query(insertGroupQuery, [groupName], (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        });
      });

      console.log(`Group created with ID: ${groupId}`); // Debug log

      // Add the user as a member of the group
      await new Promise((resolve, reject) => {
        const insertMemberQuery = `INSERT INTO Group_members (u_id, g_id, joined_at) VALUES (?, ?, CURDATE());`;
        conn.query(insertMemberQuery, [userId, groupId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log(`User ${userId} added to group ${groupId}`); // Debug log

      // Link the group to the subscription type and set the user as the owner
      await new Promise((resolve, reject) => {
        const insertSubscriptionQuery = `
          INSERT INTO Subscription (billing_date, owner_id, group_id, type_id)
          VALUES (CURDATE(), ?, ?, ?)
          ON DUPLICATE KEY UPDATE owner_id = VALUES(owner_id);
        `;
        conn.query(insertSubscriptionQuery, [userId, groupId, typeId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log(`Subscription updated for group ${groupId} with typeId ${typeId}`); // Debug log

      resolve(groupId);
    } catch (error) {
      reject(error);
    }
  });
};

dataPool.joinGroup = (groupId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if the user is already a member of the group
      const isMember = await new Promise((resolve, reject) => {
        const query = `
          SELECT COUNT(*) AS count
          FROM Group_members
          WHERE u_id = ? AND g_id = ?;
        `;
        conn.query(query, [userId, groupId], (err, results) => {
          if (err) return reject(err);
          resolve(results[0].count > 0);
        });
      });

      if (isMember) {
        return reject(new Error('User is already a member of this group'));
      }

      // Add the user to the group
      await new Promise((resolve, reject) => {
        const insertQuery = `
          INSERT INTO Group_members (u_id, g_id, joined_at)
          VALUES (?, ?, CURDATE());
        `;
        conn.query(insertQuery, [userId, groupId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log(`User ${userId} joined group ${groupId}`); // Debug log

      // Update the subscription owner_id to the latest user who joined
      await new Promise((resolve, reject) => {
        const updateSubscriptionQuery = `
          UPDATE Subscription
          SET owner_id = ?
          WHERE group_id = ?;
        `;
        conn.query(updateSubscriptionQuery, [userId, groupId], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      console.log(`Subscription updated for group ${groupId} with new owner_id ${userId}`); // Debug log

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

dataPool.isUserPartOfGroup = (typeId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM Group_members gm
      JOIN Subscription s ON gm.g_id = s.group_id
      WHERE s.type_id = ? AND gm.u_id = ?;
    `;
    conn.query(query, [typeId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0].count > 0);
    });
  });
};

dataPool.unsubscribeUserFromService = (typeId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`Unsubscribing user ${userId} from type ${typeId}`);

      // Step 1: Delete the user from Group_members
      console.log('Step 1: Deleting user from Group_members...');
      const deleteGroupMembersQuery = `
        DELETE gm
        FROM Group_members gm
        JOIN Subscription s ON gm.g_id = s.group_id
        WHERE s.type_id = ? AND gm.u_id = ?;
      `;
      console.log('Executing SQL:', deleteGroupMembersQuery, [typeId, userId]); // Log the SQL query
      await new Promise((resolve, reject) => {
        conn.query(deleteGroupMembersQuery, [typeId, userId], (err) => {
          if (err) {
            console.error('Error deleting from Group_members:', err);
            return reject(err);
          }
          console.log('User deleted from Group_members');
          resolve();
        });
      });

      // Step 2: Check if there are any remaining members in the group
      console.log('Step 2: Checking for remaining members...');
      const checkRemainingMembersQuery = `
        SELECT COUNT(*) AS count
        FROM Group_members gm
        JOIN Subscription s ON gm.g_id = s.group_id
        WHERE s.type_id = ?;
      `;
      console.log('Executing SQL:', checkRemainingMembersQuery, [typeId]); // Log the SQL query
      const hasMembers = await new Promise((resolve, reject) => {
        conn.query(checkRemainingMembersQuery, [typeId], (err, results) => {
          if (err) {
            console.error('Error checking remaining members:', err);
            return reject(err);
          }
          console.log(`Remaining members count: ${results[0].count}`);
          resolve(results[0].count > 0); // Return true if there are members
        });
      });

      // Step 3: If no members remain, delete the subscription
      if (!hasMembers) {
        console.log('Step 3: No members remain, deleting subscription...');
        const deleteSubscriptionQuery = `
          DELETE FROM Subscription
          WHERE type_id = ? AND owner_id = ?;
        `;
        console.log('Executing SQL:', deleteSubscriptionQuery, [typeId, userId]); // Log the SQL query
        await new Promise((resolve, reject) => {
          conn.query(deleteSubscriptionQuery, [typeId, userId], (err) => {
            if (err) {
              console.error('Error deleting subscription:', err);
              return reject(err);
            }
            console.log('Subscription deleted');
            resolve();
          });
        });
      } else {
        console.log('Members still exist, subscription not deleted');
      }

      resolve();
    } catch (error) {
      console.error('Error in unsubscribeUserFromService:', error);
      reject(error);
    }
  });
};

dataPool.getTypeIdByServiceName = (serviceName) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT type_id
      FROM SubscriptionTypeList
      WHERE service_name = ?;
    `;
    conn.query(query, [serviceName], (err, results) => {
      if (err) {
        console.error('Error fetching typeId by serviceName:', err);
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = dataPool;