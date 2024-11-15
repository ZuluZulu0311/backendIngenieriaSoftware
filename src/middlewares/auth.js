import jwt from 'jsonwebtoken';

export const verificarToken = (options = {}) => (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No se proporcionó el token.' });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => { 
        if (err) {
            return res.status(401).json({ message: 'Token no válido.' });
        }

        req.userId = decoded.userId;
        req.nickName = decoded.nickName;

        // Verifica si se debe hacer la validación de `userId` en el cuerpo
        if (options.validateSelf && req.body.userId && req.body.userId !== decoded.userId) {
            return res.status(403).json({ message: 'No estás autorizado para realizar esta acción.' });
        }

        next(); 
    });
};



