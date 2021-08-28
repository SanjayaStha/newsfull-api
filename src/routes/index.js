import express from 'express';
const authRoutes = require("./authRoutes");
const profileRoutes = require('./profileRoutes');
const userRoutes = require('./userRoutes')


const router = express.Router();

router.get('/', (req, res, next) => {
	res.send('HOME');
});

router.use('/api/auth', authRoutes)
router.use('/api/user', userRoutes)
router.use('/api/profile', profileRoutes)

// const router = (app) => {
// 	app.use("/api/auth", authRoutes);


// 	app.use("*", (req, res) =>
//     res.status(404).send({
//       status: "error",
//       message: "Nothing is associated with this route",
//     })
//   );
// }

module.exports = router;