const express = require('express');
const joi = require('joi');
const fs = require('fs');
const app = express();
const usersFilePath = './users.json'; // Путь к файлу с пользователями

const userSchema = joi.object({
  firstName: joi.string().min(1).required(),
  secondName: joi.string().min(1).required(),
  age: joi.number().min(0).max(150).required(),
  city: joi.string().min(1)
});

app.use(express.json());

// Функция для чтения пользователей из файла
const readUsersFromFile = () => {
  if (!fs.existsSync(usersFilePath)) return [];
  const fileData = fs.readFileSync(usersFilePath);
  return JSON.parse(fileData);
};

// Функция для записи пользователей в файл
const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

app.get('/users', (req, res) => {
  const users = readUsersFromFile();
  res.send({ users });
});

app.get('/users/:id', (req, res) => {
  const userID = req.params.id;
  const users = readUsersFromFile();
  const user = users.find((user) => user.id === Number(userID));
  
  if (user) {
    res.send({ user });
  } else {
    res.status(404).send({ user: null });
  }
});

app.post('/users', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details });
  }

  const users = readUsersFromFile();
  const uniqueID = users.length > 0 ? users[users.length - 1].id + 1 : 1; // Генерация ID
  const newUser = {
    id: uniqueID,
    ...req.body
  };

  users.push(newUser);
  writeUsersToFile(users);
  res.send({ id: uniqueID });
});

app.put('/users/:id', (req, res) => {
  const result = userSchema.validate(req.body);
  if (result.error) {
    return res.status(400).send({ error: result.error.details });
  }

  const userID = req.params.id;
  const users = readUsersFromFile();
  const user = users.find((user) => user.id === Number(userID));

  if (user) {
    Object.assign(user, req.body);
    writeUsersToFile(users);
    res.send({ user });
  } else {
    res.status(404).send({ user: null });
  }
});

app.delete('/users/:id', (req, res) => {
  const userID = +req.params.id;
  const users = readUsersFromFile();
  const userIndex = users.findIndex(user => user.id === userID);

  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1);
    writeUsersToFile(users);
    res.send({ user: deletedUser });
  } else {
    res.status(404).send({ user: null });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});