# Prospec

Aplicação web para **gestão de prospecção comercial**: organização de **projetos** e cadastro de **leads**, com informações de contato, status de abordagem e conversão, dados de reputação (ex.: avaliações) e observações. O acesso é feito com autenticação de usuários; os dados ficam em banco PostgreSQL (via Drizzle ORM).

Stack principal: **Next.js**, **React**, **Better Auth**, **Drizzle** e **Tailwind CSS**.

## Uso e propriedade

O **uso deste sistema e do código associado é de propriedade exclusiva da conta proprietária deste repositório**. Não há licença implícita para terceiros copiar, hospedar ou utilizar o software sem autorização expressa do titular.

## Desenvolvimento

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

Configure as variáveis de ambiente (por exemplo em `.env`) conforme necessário para banco de dados, autenticação e serviços externos.

### Banco de dados

Comandos úteis (Drizzle):

```bash
npm run db:generate
npm run db:push
npm run db:studio
```

## Documentação

- [Next.js](https://nextjs.org/docs)
