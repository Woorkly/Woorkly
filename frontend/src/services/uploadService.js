import API from './api'

const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await API.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}

const uploadRoomImage = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await API.post('/upload/room-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}

const uploadRoomGallery = async (file) => {
  const formData = new FormData()
  formData.append('image', file)
  const res = await API.post('/upload/room-gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data.url
}

export default { uploadAvatar, uploadRoomImage, uploadRoomGallery }
