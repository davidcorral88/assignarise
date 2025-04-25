
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const POWER_BI_CONFIG = {
  authorityUrl: 'https://login.microsoftonline.com/organizations',
  powerBiUser: process.env.POWER_BI_USER || 'Aplicaciones@temagc.com',
  powerBiPass: process.env.POWER_BI_PASS || 'Tav21506',
  clientId: 'd21cc7a2-569f-42dc-9770-e9b2442fd34f',
  workspaceId: '0c774742-db78-46fd-b0f5-76fe82d6ffcc',
  reportId: 'e21fe0eb-34b3-45e3-a9c9-7318ec1f1e4a',
  scope: ['https://analysis.windows.net/powerbi/api/.default']
};

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id: POWER_BI_CONFIG.clientId,
    scope: POWER_BI_CONFIG.scope.join(' '),
    username: POWER_BI_CONFIG.powerBiUser,
    password: POWER_BI_CONFIG.powerBiPass
  });

  const response = await fetch(`${POWER_BI_CONFIG.authorityUrl}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function getEmbedInfo(accessToken) {
  const response = await fetch(
    `https://api.powerbi.com/v1.0/myorg/groups/${POWER_BI_CONFIG.workspaceId}/reports/${POWER_BI_CONFIG.reportId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get report info');
  }

  const report = await response.json();
  return {
    embedUrl: report.embedUrl,
    reportId: report.id
  };
}

router.get('/token', async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const embedInfo = await getEmbedInfo(accessToken);
    
    res.json({
      accessToken,
      ...embedInfo
    });
  } catch (error) {
    console.error('PowerBI token error:', error);
    res.status(500).json({ error: 'Failed to get PowerBI token' });
  }
});

module.exports = router;
