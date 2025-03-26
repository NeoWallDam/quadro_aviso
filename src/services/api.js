import axios from 'axios';

const GIST_URL = `https://raw.githubusercontent.com/NeoWallDam/quadro_aviso/refs/heads/main/informacoes_quadro.json?t=${Date.now()}`;

const api = {
  getDados: async () => {
    try {
      const response = await axios.get(GIST_URL);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do Gist:', error);
      throw error;
    }
  }
};

export default api;