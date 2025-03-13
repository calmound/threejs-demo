-- 用户管理增量SQL脚本
-- 创建用户表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
);

-- 插入新用户的存储过程
DELIMITER //
CREATE PROCEDURE insert_user(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    INSERT INTO users (username, email, password) 
    VALUES (p_username, p_email, p_password);
END //
DELIMITER ;

-- 更新用户信息的存储过程
DELIMITER //
CREATE PROCEDURE update_user(
    IN p_user_id INT,
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_status ENUM('active', 'inactive', 'suspended')
)
BEGIN
    UPDATE users 
    SET 
        username = COALESCE(p_username, username),
        email = COALESCE(p_email, email),
        status = COALESCE(p_status, status)
    WHERE id = p_user_id;
END //
DELIMITER ;

-- 删除用户的存储过程
DELIMITER //
CREATE PROCEDURE delete_user(
    IN p_user_id INT
)
BEGIN
    DELETE FROM users WHERE id = p_user_id;
END //
DELIMITER ;

-- 查询用户的存储过程（支持多种查询方式）
DELIMITER //
CREATE PROCEDURE search_users(
    IN p_username VARCHAR(50),
    IN p_email VARCHAR(100),
    IN p_status ENUM('active', 'inactive', 'suspended')
)
BEGIN
    SELECT * FROM users
    WHERE 
        (p_username IS NULL OR username LIKE CONCAT('%', p_username, '%'))
        AND (p_email IS NULL OR email LIKE CONCAT('%', p_email, '%'))
        AND (p_status IS NULL OR status = p_status);
END //
DELIMITER ;

-- 示例调用存储过程
-- 插入用户：CALL insert_user('johndoe', 'john@example.com', 'hashedpassword');
-- 更新用户：CALL update_user(1, NULL, 'newemail@example.com', 'active');
-- 删除用户：CALL delete_user(1);
-- 搜索用户：CALL search_users(NULL, NULL, 'active');
