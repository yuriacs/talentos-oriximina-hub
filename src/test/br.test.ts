import { describe, expect, it } from 'vitest';
import { isValidCNPJ, isValidPhone, isValidUrl, maskCEP, maskCNPJ, maskPhone, normalizeInstagram, normalizeUrl } from '@/lib/br';
import { getRedirectPath } from '@/lib/redirect';

describe('máscaras', () => {
  it('formata CNPJ, telefone e CEP enquanto digita', () => {
    expect(maskCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    expect(maskCNPJ('11.222.333/0001-8199')).toBe('11.222.333/0001-81');
    expect(maskPhone('93')).toBe('(93');
    expect(maskPhone('9399999')).toBe('(93) 9999-9');
    expect(maskPhone('93999998888')).toBe('(93) 99999-8888');
    expect(maskPhone('9335441234')).toBe('(93) 3544-1234');
    expect(maskCEP('68270000')).toBe('68270-000');
  });
});

describe('validações', () => {
  it('confere os dígitos do CNPJ', () => {
    expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    expect(isValidCNPJ('11.222.333/0001-82')).toBe(false);
    expect(isValidCNPJ('11.111.111/1111-11')).toBe(false);
    expect(isValidCNPJ('123')).toBe(false);
  });

  it('aceita telefone com DDD', () => {
    expect(isValidPhone('(93) 99999-8888')).toBe(true);
    expect(isValidPhone('(93) 3544-1234')).toBe(true);
    expect(isValidPhone('99999-8888')).toBe(false);
  });

  it('aceita site sem https e recusa texto solto', () => {
    expect(isValidUrl('www.empresa.com.br')).toBe(true);
    expect(isValidUrl('')).toBe(true);
    expect(isValidUrl('minha empresa')).toBe(false);
    expect(normalizeUrl('www.empresa.com.br')).toBe('https://www.empresa.com.br');
    expect(normalizeUrl('http://empresa.com')).toBe('http://empresa.com');
  });

  it('transforma o Instagram em link', () => {
    expect(normalizeInstagram('@empresa')).toBe('https://instagram.com/empresa');
    expect(normalizeInstagram('https://www.instagram.com/empresa/?hl=pt')).toBe('https://instagram.com/empresa');
    expect(normalizeInstagram('')).toBe('');
  });
});

describe('redirecionamento', () => {
  it('só aceita caminhos internos', () => {
    expect(getRedirectPath('?redirect=/cadastro-empresa')).toBe('/cadastro-empresa');
    expect(getRedirectPath('?redirect=//site-malicioso.com')).toBeNull();
    expect(getRedirectPath('?redirect=https://site-malicioso.com')).toBeNull();
    expect(getRedirectPath('')).toBeNull();
  });
});
