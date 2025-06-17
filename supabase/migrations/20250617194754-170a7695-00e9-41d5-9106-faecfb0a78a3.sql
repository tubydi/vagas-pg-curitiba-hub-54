
-- Primeiro, vamos verificar se o usuário admin já existe
DO $$
DECLARE
    admin_exists boolean;
    admin_user_id uuid;
BEGIN
    -- Verificar se o usuário já existe
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@vagaspg.com') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Se não existir, criar o usuário admin
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'admin@vagaspg.com',
            crypt('admin123456', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false
        );
        
        RAISE NOTICE 'Usuário admin criado com sucesso';
    ELSE
        -- Se existir, apenas atualizar a senha
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('admin123456', gen_salt('bf')),
            updated_at = now(),
            email_confirmed_at = now()
        WHERE email = 'admin@vagaspg.com';
        
        RAISE NOTICE 'Senha do usuário admin atualizada';
    END IF;
    
    -- Garantir que o email está confirmado
    UPDATE auth.users 
    SET email_confirmed_at = now()
    WHERE email = 'admin@vagaspg.com' AND email_confirmed_at IS NULL;
END $$;

-- Criar um perfil para o usuário admin se não existir
INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email, 'admin'::user_role
FROM auth.users u
WHERE u.email = 'admin@vagaspg.com'
AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);
