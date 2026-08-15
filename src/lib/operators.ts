export interface CashOperator {
  id: string;
  fullName: string;
  cpf: string;
  username: string; // Ex: "@Maycon"
  passwordHash: string;
  createdAt: string;
}

const STORAGE_OPERATORS = 'garagem_cash_operators';

export function getOperators(): CashOperator[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_OPERATORS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveOperator(operatorData: {
  id?: string;
  fullName: string;
  cpf: string;
  username: string;
  password: string;
}): { success: boolean; message: string; operator?: CashOperator } {
  if (typeof window === 'undefined') return { success: false, message: 'Navegador não carregado.' };

  const operators = getOperators();
  const rawUsername = operatorData.username.trim();
  const cleanUsername = rawUsername.startsWith('@') ? rawUsername : `@${rawUsername}`;

  if (!operatorData.fullName.trim() || !operatorData.cpf.trim() || !rawUsername || !operatorData.password) {
    return { success: false, message: 'Todos os campos são obrigatórios.' };
  }

  // Verifica duplicação de username de login
  const existing = operators.find(
    (o) => o.username.toLowerCase() === cleanUsername.toLowerCase() && o.id !== operatorData.id
  );

  if (existing) {
    return { success: false, message: 'Já existe um operador cadastrado com este Login!' };
  }

  let savedOp: CashOperator;

  if (operatorData.id) {
    // Editar existente
    const index = operators.findIndex((o) => o.id === operatorData.id);
    if (index === -1) return { success: false, message: 'Operador não encontrado.' };

    savedOp = {
      ...operators[index],
      fullName: operatorData.fullName.trim(),
      cpf: operatorData.cpf.trim(),
      username: cleanUsername,
      passwordHash: operatorData.password,
    };
    operators[index] = savedOp;
  } else {
    // Novo cadastro
    savedOp = {
      id: Date.now().toString(),
      fullName: operatorData.fullName.trim(),
      cpf: operatorData.cpf.trim(),
      username: cleanUsername,
      passwordHash: operatorData.password,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };
    operators.push(savedOp);
  }

  localStorage.setItem(STORAGE_OPERATORS, JSON.stringify(operators));
  return { success: true, message: 'Operador salvo com sucesso!', operator: savedOp };
}

export function deleteOperator(id: string): { success: boolean; message: string } {
  if (typeof window === 'undefined') return { success: false, message: 'Erro no navegador.' };
  const operators = getOperators().filter((o) => o.id !== id);
  localStorage.setItem(STORAGE_OPERATORS, JSON.stringify(operators));
  return { success: true, message: 'Operador removido com sucesso.' };
}

export function authenticateOperator(
  usernameInput: string,
  passwordInput: string
): { success: boolean; message: string; operator?: CashOperator } {
  const operators = getOperators();
  const rawUsername = usernameInput.trim();
  const cleanUsername = rawUsername.startsWith('@') ? rawUsername.toLowerCase() : `@${rawUsername.toLowerCase()}`;

  const op = operators.find(
    (o) => o.username.toLowerCase() === cleanUsername && o.passwordHash === passwordInput
  );

  if (!op) {
    return { success: false, message: 'Login de Operador ou Senha incorretos!' };
  }

  return { success: true, message: 'Operador autenticado!', operator: op };
}