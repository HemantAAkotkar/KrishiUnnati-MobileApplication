// Its a utility function to generate a custom user ID based on the user's role and current timestamp.
// The ID format is: <rolePrefix><DD><MM><YYYY><HH><MM><SS><randomNumber>
// where <rolePrefix> is a prefix based on the user's role, and <randomNumber> is a 2-digit random number.
// The function ensures that the generated ID is unique and can be used to identify users in the system.

const generateUserId = (role) => {

    const rolePrefix = role.charAt(0).toUpperCase(); // F or B

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hour = pad(now.getHours());
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());

    const rand = Math.floor(Math.random() * 90 + 10); // 2-digit random number

    return `${rolePrefix}${day}${month}${year}${hour}${min}${sec}${rand}`;
};

module.exports = generateUserId;