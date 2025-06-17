
-- Desabilitar confirmação de email completamente
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;

-- Criar função para confirmar emails automaticamente
CREATE OR REPLACE FUNCTION confirm_user_email(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE auth.users 
  SET email_confirmed_at = now() 
  WHERE id = user_id AND email_confirmed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para confirmar automaticamente novos usuários
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Confirmar email automaticamente
  NEW.email_confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em novos usuários
CREATE OR REPLACE TRIGGER auto_confirm_new_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_users();
