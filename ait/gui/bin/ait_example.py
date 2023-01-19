import socket
import struct
import time

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
hs_packet = struct.Struct('>hhhhh')

for i in range(100):
    buf = hs_packet.pack(i, i, i, i, i)
    s.sendto(buf, ('localhost', 3076))
    time.sleep(1)
