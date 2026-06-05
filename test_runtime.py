import socket

s = socket.socket()
s.connect(('127.0.0.1', 4242))
s.send(b'{"cmd":"get_tree"}\n')

# Read until we get a full line
data = b''
while b'\n' not in data:
    chunk = s.recv(4096)
    if not chunk:
        break
    data += chunk

line = data.split(b'\n', 1)[0]
print(line.decode('utf-8', errors='replace'))
