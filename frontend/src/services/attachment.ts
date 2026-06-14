import api from './api';

export const attachmentService = {
  /**
   * Upload a file and get its URL
   */
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await api.post('/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
