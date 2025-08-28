const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { logger } = require('../server');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUserCreation, validateUserUpdate } = require('../middleware/validation');

// Listar todos os usuários (apenas para admin)
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    logger.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários', error: error.message });
  }
});

// Obter usuário por ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error(`Erro ao buscar usuário ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
});

// Criar novo usuário
router.post('/', validateUserCreation, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    
    const user = new User({
      name,
      email,
      password, // Em produção, deve-se usar hash da senha
      role
    });
    
    await user.save();
    
    logger.info(`Novo usuário criado: ${user.email}`, { userId: user._id, role: user.role });
    
    // Não retornar a senha
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    logger.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Atualizar usuário
router.put('/:id', authenticate, authorize(['admin']), validateUserUpdate, async (req, res) => {
  try {
    const { name, email, role, active } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    
    await user.save();
    
    logger.info(`Usuário atualizado: ${user.email}`, { userId: user._id });
    
    // Não retornar a senha
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    logger.error(`Erro ao atualizar usuário ${req.params.id}:`, error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Em produção, deve-se comparar o hash da senha
    if (user.password !== password) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();
    
    logger.info(`Usuário logado: ${user.email}`, { userId: user._id, role: user.role });
    
    // Não retornar a senha
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({
      user: userResponse,
      // Em produção, deve-se gerar um token JWT
      token: 'token-simulado'
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no login', error: error.message });
  }
});

module.exports = router;