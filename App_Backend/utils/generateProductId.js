
const generateProductId = () => {

    let role = "Product";
    const prefix = role.charAt(0).toUpperCase(); // P

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hour = pad(now.getHours());
    const min = pad(now.getMinutes());
    const sec = pad(now.getSeconds());

    return `${prefix}${day}${month}${year}${hour}${min}${sec}`;
};

module.exports = generateProductId;