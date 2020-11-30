import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 5000
});

// Get the default connection
const connect = mongoose.connection;

connect.on('error', () => console.error('連線到mLab失敗'));
connect.once('open', () => console.log('已跟mLab連線'));

export default connect;