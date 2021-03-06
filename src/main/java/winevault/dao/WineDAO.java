package winevault.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import winevault.model.IWine;
import winevault.model.Wine;
import winevault.util.ConnectionUtil;
import winevault.util.IConnectionData;

public class WineDAO implements IWineDAO {
	private IConnectionData connData;
	
	public WineDAO(IConnectionData connData) {
		this.connData = connData;
	}
	
	public void addWine(IWine wine) {
		Connection conn = null;
		PreparedStatement statement = null;
		try {
			conn = ConnectionUtil.getConnection(connData);
			String sql = "INSERT INTO wines (variety) values (?)";
			statement = conn.prepareStatement(sql);
			statement.setString(1, wine.getName());
			statement.executeUpdate();
			conn.close();
		}catch(Exception e) {
			e.printStackTrace();
		}
	}
	
	public List<IWine> getWineList(){
		Connection conn = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		List<IWine> wines = new ArrayList<IWine>();
		try {
			conn = ConnectionUtil.getConnection(connData);
			statement = conn.prepareStatement("SELECT * FROM wines");
			rs = statement.executeQuery();
			while(rs.next()) {
				wines.add(new Wine(
						rs.getInt(1),
						rs.getString(2),
						rs.getString(3),
						rs.getDouble(4),
						rs.getDouble(5),
						rs.getDouble(6)
				));
			}
			conn.close();
		}catch(Exception e) {
			e.printStackTrace();
		}
		return wines;
	}
	
	public IWine getWineByID(int id) {
		Connection conn = null;
		PreparedStatement statement = null;
		ResultSet rs = null;
		IWine wine = null;
		try {
			conn = ConnectionUtil.getConnection(connData);
			statement = conn.prepareStatement("SELECT * FROM wines WHERE id = ?");
			statement.setInt(1, id);
			rs = statement.executeQuery();
			if(rs.next()) {
				wine = new Wine(
						rs.getInt(1),
						rs.getString(2),
						rs.getString(3),
						rs.getDouble(4),
						rs.getDouble(5),
						rs.getDouble(6)
				);
			}
			conn.close();
		} catch(Exception e) {
			e.printStackTrace();
		}
		return wine;
	}
}
