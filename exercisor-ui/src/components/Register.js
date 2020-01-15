import React from 'react';

export default function Register({ user, pwd, pwd2, onRegister, onSetUser, onSetPwd, onSetPwd2, error }) {
  const samePwd = pwd === pwd2;
  const userNameOk = user != null && user.length > 2
  const pwdOk = pwd != null && pwd.length > 4 && pwd !== user;
  const canSave = samePwd && userNameOk && pwdOk;
  const errMsg = !userNameOk ? "För kort användarnamn" : (
    !pwdOk ? "Lösenord för kort eller samma som användarnamn" : (
    !samePwd ? "Lösenord inte samma" : null
    )
  );
  return (
    <div>
      {error != null && <div className="error">{error}</div>}
      <table>
        <tbody>
          <tr>
            <th>Användare:</th>
            <td>
              <input id="reg-user-name" type="text" value={user} placeholder="namn" onChange={onSetUser} />
            </td>
          </tr>
          <tr>
            <th>Lösenord:</th>
            <td>
              <input id="reg-user-pwd" type="password" value={pwd} onChange={onSetPwd} />
            </td>
          </tr>
          <tr>
            <th>Upprepa lösenord:</th>
            <td>
              <input id="reg-user-pwd2" type="password" value={pwd2} onChange={onSetPwd2} />
            </td>
          </tr>
        </tbody>
      </table>
      {!canSave && <div className="error">{errMsg}</div>}
      <button onClick={() => canSave ? onRegister() : null} disabled={canSave ? null : "disabled"}>Registera</button>
    </div>
  );
}
