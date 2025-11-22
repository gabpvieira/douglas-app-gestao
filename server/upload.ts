import multer from 'multer';

// Configuração de storage em memória (para upload direto ao Supabase)
const storage = multer.memoryStorage();

// Configuração do multer
export const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Tipos de arquivo permitidos
    const allowedMimes = [
      // PDFs
      'application/pdf',
      // Vídeos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/mpeg',
      'video/webm',
      // Imagens
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  }
});

// Validadores específicos por tipo
export const uploadPDF = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  }
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const videoMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/webm'];
    if (videoMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas vídeos são permitidos (MP4, MOV, AVI, MPEG, WEBM)'));
    }
  }
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (JPEG, PNG, WEBP, GIF)'));
    }
  }
});

// Upload de vídeo + thumbnail
export const uploadVideoWithThumbnail = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const videoMimes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/mpeg', 'video/webm'];
    const imageMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    
    if (videoMimes.includes(file.mimetype) || imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas vídeos e imagens são permitidos'));
    }
  }
});
