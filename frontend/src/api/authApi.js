// hardcoded admin credentials
const ADMIN = {
  email: "admin@tetech.com",
  password: "123456",
};

export const loginUser = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === ADMIN.email && password === ADMIN.password) {
        resolve({
          success: true,
          user: {
            name: "Admin",
            role: "admin",
            email: ADMIN.email,
          },
        });
      } else {
        reject({
          success: false,
          message: "Invalid credentials",
        });
      }
    }, 500); // simulate API delay
  });
};

export const getMe = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};