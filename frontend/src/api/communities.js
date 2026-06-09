import api from './client'

export const getCommunitiesRequest = (params = {}) =>
  api.get('/communities', { params })

export const getCommunityRequest = (communityId) =>
  api.get(`/communities/${communityId}`)

export const createCommunityRequest = (payload) =>
  api.post('/communities', payload)

export const updateCommunityRequest = (communityId, payload) =>
  api.put(`/communities/${communityId}`, payload)

export const joinCommunityRequest = (communityId) =>
  api.post(`/communities/${communityId}/join`)

export const leaveCommunityRequest = (communityId) =>
  api.delete(`/communities/${communityId}/leave`)

export const getMembershipRequestsRequest = (communityId) =>
  api.get(`/communities/${communityId}/membership-requests`)

export const approveMembershipRequestRequest = (communityId, membershipId) =>
  api.post(`/communities/${communityId}/membership-requests/${membershipId}/approve`)

export const rejectMembershipRequestRequest = (communityId, membershipId) =>
  api.delete(`/communities/${communityId}/membership-requests/${membershipId}`)
