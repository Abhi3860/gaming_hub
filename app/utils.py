#from passlib.context import CryptContext
#pwd_context = CryptContext(schemes="bcrypt",deprecated="auto")
from pwdlib import PasswordHash
pwd_context = PasswordHash.recommended()


def hash(password:str):
    return pwd_context.hash(password)

def verify(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)